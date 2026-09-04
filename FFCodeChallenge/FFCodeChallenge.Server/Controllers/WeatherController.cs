using System.Text.RegularExpressions;
using FFCodeChallenge.Server.Models;
using FFCodeChallenge.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace FFCodeChallenge.Server.Controllers
{
    [ApiController]
    [Route("api/weather")]
    public class WeatherController : ControllerBase
    {
        private static readonly Regex IcaoPattern = new("^[A-Za-z]{4}$", RegexOptions.Compiled);

        private readonly IForeFlightWeatherClient _weatherClient;

        public WeatherController(IForeFlightWeatherClient weatherClient)
        {
            _weatherClient = weatherClient;
        }

        /// <summary>Everything: current conditions and forecast.</summary>
        [HttpGet("{icaoCode}")]
        [OutputCache(PolicyName = OutputCachePolicies.FiveMinutesCache)]
        public Task<ActionResult<AirportWeatherDto>> Get(string icaoCode, CancellationToken cancellationToken)
        {
            return GetProjectionAsync(icaoCode, weather => weather, cancellationToken);
        }

        /// <summary>Current conditions only.</summary>
        [HttpGet("{icaoCode}/metar")]
        [OutputCache(PolicyName = OutputCachePolicies.FiveMinutesCache)]
        public Task<ActionResult<MetarDto>> GetMetar(string icaoCode, CancellationToken cancellationToken)
        {
            return GetProjectionAsync(icaoCode, weather => weather.Metar, cancellationToken);
        }

        /// <summary>Forecast only. 404s for airports that publish no TAF.</summary>
        [HttpGet("{icaoCode}/taf")]
        [OutputCache(PolicyName = OutputCachePolicies.FiveMinutesCache)]
        public Task<ActionResult<TafDto>> GetTaf(string icaoCode, CancellationToken cancellationToken)
        {
            return GetProjectionAsync(icaoCode, weather => weather.Taf, cancellationToken);
        }

        /// <summary>
        /// Shared plumbing for all three endpoints. ForeFlight returns the METAR and the TAF
        /// in a single payload, so the narrower endpoints fetch the same report and project
        /// from it rather than making a second identical upstream call. Keeping the
        /// validation and error mapping here stops it being written out three times.
        /// </summary>
        private async Task<ActionResult<T>> GetProjectionAsync<T>(
            string icaoCode,
            Func<AirportWeatherDto, T?> project,
            CancellationToken cancellationToken)
            where T : class
        {
            if (!IcaoPattern.IsMatch(icaoCode))
            {
                return BadRequest("ICAO code must be exactly 4 letters.");
            }

            try
            {
                var weather = await _weatherClient.GetWeatherAsync(icaoCode.ToUpperInvariant(), cancellationToken);

                if (weather is null)
                {
                    return NotFound();
                }

                var projection = project(weather);

                // A null projection means the airport has no data of that kind -- currently
                // only reachable via /taf, for a field that publishes a METAR but no TAF.
                if (projection is null)
                {
                    return NotFound();
                }

                return Ok(projection);
            }
            catch (HttpRequestException)
            {
                return StatusCode(StatusCodes.Status502BadGateway, "Unable to retrieve weather data.");
            }
        }
    }
}
