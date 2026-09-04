using System.Text.RegularExpressions;
using FFCodeChallenge.Server.Models;
using FFCodeChallenge.Server.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("{icaoCode}")]
        public async Task<ActionResult<AirportWeatherDto>> Get(string icaoCode, CancellationToken cancellationToken)
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

                return Ok(weather);
            }
            catch (HttpRequestException)
            {
                return StatusCode(StatusCodes.Status502BadGateway, "Unable to retrieve weather data.");
            }
        }
    }
}
