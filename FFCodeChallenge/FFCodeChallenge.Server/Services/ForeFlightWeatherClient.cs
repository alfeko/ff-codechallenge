using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FFCodeChallenge.Server.Models;
using FFCodeChallenge.Server.Models.ForeFlight;
using FFCodeChallenge.Server.Services.Rules;

namespace FFCodeChallenge.Server.Services
{
    public interface IForeFlightWeatherClient
    {
        Task<AirportWeatherDto?> GetWeatherAsync(string icao, CancellationToken cancellationToken);
    }

    public class ForeFlightWeatherClient : IForeFlightWeatherClient
    {
        /// <summary>
        /// DELIBERATE artificial latency -- this is not a real network cost and is not a
        /// bug. It exists so the effect of the five-minute output cache is visible: the
        /// first lookup for an airport takes ~2s, the next is served by the cache
        /// middleware and never reaches this class. Delete this to make the API realistic.
        /// </summary>
        private static readonly TimeSpan ArtificialDelay = TimeSpan.FromSeconds(2);

        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly HttpClient _httpClient;
        private readonly FlightCategoryEngine _categoryEngine;

        public ForeFlightWeatherClient(HttpClient httpClient, FlightCategoryEngine categoryEngine)
        {
            _httpClient = httpClient;
            _categoryEngine = categoryEngine;
        }

        public async Task<AirportWeatherDto?> GetWeatherAsync(string icao, CancellationToken cancellationToken)
        {
            // See ArtificialDelay: simulated slowness to demonstrate the cache.
            await Task.Delay(ArtificialDelay, cancellationToken);

            using var response = await _httpClient.GetAsync(icao, cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<ForeFlightWeatherResponse>(SerializerOptions, cancellationToken);
            var conditions = payload?.Report?.Conditions;

            // Current conditions stay mandatory: temperature and pressure have no meaningful
            // value without a METAR, so a forecast-only response is treated as "no report".
            if (conditions is null)
            {
                return null;
            }

            return new AirportWeatherDto
            {
                Icao = icao,
                Metar = MapMetar(icao, conditions),
                Taf = MapTaf(icao, payload?.Report?.Forecast)
            };
        }

        private MetarDto MapMetar(string icao, ForeFlightConditions conditions)
        {
            // Current conditions have always exposed a non-null wind and visibility, so keep
            // coalescing to defaults here even though the shared mappers can return null.
            var wind = MapWind(conditions.Wind) ?? new WindDto();
            var visibility = MapVisibility(conditions.Visibility) ?? new VisibilityDto();
            var cloudLayers = MapCloudLayers(conditions.CloudLayers);

            return new MetarDto
            {
                Icao = icao,
                TemperatureC = conditions.TempC,
                PressureHg = conditions.PressureHg,
                PressureHpa = conditions.PressureHpa,
                Visibility = visibility,
                Wind = wind,
                Runways = MapRunways(wind),
                CloudLayers = cloudLayers,
                Category = _categoryEngine.Assess(visibility, cloudLayers)
            };
        }

        private TafDto? MapTaf(string icao, ForeFlightForecast? forecast)
        {
            if (forecast is null)
            {
                return null;
            }

            return new TafDto
            {
                Icao = icao,
                Text = forecast.Text,
                DateIssued = ForeFlightTimestamp.Parse(forecast.DateIssued),
                ValidFrom = ForeFlightTimestamp.Parse(forecast.Period?.DateStart),
                ValidTo = ForeFlightTimestamp.Parse(forecast.Period?.DateEnd),

                // Source order is preserved deliberately: TEMPO and PROB groups are nested
                // inside the surrounding period's time span rather than following it, so
                // sorting by start time would scramble the TAF's meaning.
                Periods = forecast.Conditions.Select(MapForecastPeriod).ToList()
            };
        }

        private ForecastPeriodDto MapForecastPeriod(ForeFlightForecastConditions period)
        {
            var wind = MapWind(period.Wind);
            var visibility = MapVisibility(period.Visibility);
            var cloudLayers = MapCloudLayers(period.CloudLayers);

            return new ForecastPeriodDto
            {
                Text = period.Text,
                Change = period.Change,
                FlightRules = period.FlightRules,
                PeriodStart = ForeFlightTimestamp.Parse(period.Period?.DateStart),
                PeriodEnd = ForeFlightTimestamp.Parse(period.Period?.DateEnd),
                Visibility = visibility,
                Wind = wind,
                Runways = wind is null ? [] : MapRunways(wind),
                CloudLayers = cloudLayers,
                Weather = [.. period.Weather],
                Category = _categoryEngine.Assess(visibility, cloudLayers)
            };
        }

        private static WindDto? MapWind(ForeFlightWind? wind)
        {
            return wind is null
                ? null
                : new WindDto
                {
                    SpeedKts = wind.SpeedKts,
                    DirectionDegrees = wind.Direction
                };
        }

        private static VisibilityDto? MapVisibility(ForeFlightVisibility? visibility)
        {
            return visibility is null
                ? null
                : new VisibilityDto
                {
                    DistanceSm = visibility.DistanceSm,
                    DistanceMeters = visibility.DistanceMeter
                };
        }

        private static List<CloudLayerDto> MapCloudLayers(IEnumerable<ForeFlightCloudLayer> layers)
        {
            return layers.Select(layer => new CloudLayerDto
            {
                Coverage = layer.Coverage,
                Type = layer.Type,
                AltitudeFt = layer.AltitudeFt,
                Ceiling = layer.Ceiling
            }).ToList();
        }

        private static List<RunwayDto> MapRunways(WindDto wind)
        {
            return RunwayCatalog.AssumedRunways.Select(runway =>
            {
                var (headwindKts, crosswindKts) = RunwayWindCalculator.Calculate(
                    wind.SpeedKts,
                    wind.DirectionDegrees,
                    runway.HeadingDegrees);

                return new RunwayDto
                {
                    Designator = runway.Designator,
                    HeadingDegrees = runway.HeadingDegrees,
                    HeadwindKts = headwindKts,
                    CrosswindKts = crosswindKts
                };
            }).ToList();
        }
    }
}
