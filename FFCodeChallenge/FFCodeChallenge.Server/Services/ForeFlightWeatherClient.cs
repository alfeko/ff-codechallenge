using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FFCodeChallenge.Server.Models;
using FFCodeChallenge.Server.Models.ForeFlight;

namespace FFCodeChallenge.Server.Services
{
    public interface IForeFlightWeatherClient
    {
        Task<AirportWeatherDto?> GetWeatherAsync(string icao, CancellationToken cancellationToken);
    }

    public class ForeFlightWeatherClient : IForeFlightWeatherClient
    {
        private static readonly JsonSerializerOptions SerializerOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        private readonly HttpClient _httpClient;

        public ForeFlightWeatherClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<AirportWeatherDto?> GetWeatherAsync(string icao, CancellationToken cancellationToken)
        {
            using var response = await _httpClient.GetAsync(icao, cancellationToken);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            var payload = await response.Content.ReadFromJsonAsync<ForeFlightWeatherResponse>(SerializerOptions, cancellationToken);
            var conditions = payload?.Report?.Conditions;

            if (conditions is null)
            {
                return null;
            }

            return MapToDto(icao, conditions);
        }

        private static AirportWeatherDto MapToDto(string icao, ForeFlightConditions conditions)
        {
            return new AirportWeatherDto
            {
                Icao = icao,
                TemperatureC = conditions.TempC,
                PressureHg = conditions.PressureHg,
                PressureHpa = conditions.PressureHpa,
                Visibility = new VisibilityDto
                {
                    DistanceSm = conditions.Visibility?.DistanceSm ?? 0,
                    DistanceMeters = conditions.Visibility?.DistanceMeter ?? 0
                },
                Wind = new WindDto
                {
                    SpeedKts = conditions.Wind?.SpeedKts ?? 0,
                    DirectionDegrees = conditions.Wind?.Direction ?? 0
                },
                CloudLayers = conditions.CloudLayers.Select(layer => new CloudLayerDto
                {
                    Coverage = layer.Coverage,
                    AltitudeFt = layer.AltitudeFt,
                    Ceiling = layer.Ceiling
                }).ToList()
            };
        }
    }
}
