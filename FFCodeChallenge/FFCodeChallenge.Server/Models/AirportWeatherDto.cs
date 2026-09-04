namespace FFCodeChallenge.Server.Models
{
    public class AirportWeatherDto
    {
        public string Icao { get; set; } = string.Empty;

        public double TemperatureC { get; set; }

        public double PressureHg { get; set; }

        public double PressureHpa { get; set; }

        public VisibilityDto Visibility { get; set; } = new();

        public WindDto Wind { get; set; } = new();

        public List<RunwayDto> Runways { get; set; } = [];

        public List<CloudLayerDto> CloudLayers { get; set; } = [];

        /// <summary>Null when the airport publishes no TAF.</summary>
        public ForecastDto? Forecast { get; set; }
    }

    public class ForecastDto
    {
        /// <summary>Raw TAF string, provided for reference. Not rendered by the UI.</summary>
        public string? Text { get; set; }

        public DateTimeOffset? DateIssued { get; set; }

        public DateTimeOffset? ValidFrom { get; set; }

        public DateTimeOffset? ValidTo { get; set; }

        public List<ForecastPeriodDto> Periods { get; set; } = [];
    }

    public class ForecastPeriodDto
    {
        /// <summary>Raw TAF fragment for this group. Not rendered by the UI.</summary>
        public string? Text { get; set; }

        /// <summary>Change group ("Temporary", "40% probability"). Null on the prevailing period.</summary>
        public string? Change { get; set; }

        /// <summary>"vfr" | "mvfr" | "ifr" | "lifr", or null if not forecast.</summary>
        public string? FlightRules { get; set; }

        public DateTimeOffset? PeriodStart { get; set; }

        public DateTimeOffset? PeriodEnd { get; set; }

        /// <summary>Null when the period forecasts no visibility change.</summary>
        public VisibilityDto? Visibility { get; set; }

        /// <summary>Null when the period carries no wind group.</summary>
        public WindDto? Wind { get; set; }

        /// <summary>Empty when <see cref="Wind"/> is null -- components need a wind to mean anything.</summary>
        public List<RunwayDto> Runways { get; set; } = [];

        public List<CloudLayerDto> CloudLayers { get; set; } = [];

        /// <summary>Plain-English phrases, rendered as-is.</summary>
        public List<string> Weather { get; set; } = [];
    }

    public class VisibilityDto
    {
        public double DistanceSm { get; set; }

        public double DistanceMeters { get; set; }
    }

    public class WindDto
    {
        public double SpeedKts { get; set; }

        public int DirectionDegrees { get; set; }
    }

    public class RunwayDto
    {
        public string Designator { get; set; } = string.Empty;

        public int HeadingDegrees { get; set; }

        /// <summary>Positive = headwind, negative = tailwind.</summary>
        public double HeadwindKts { get; set; }

        /// <summary>Positive = wind from the pilot's right, negative = from the left.</summary>
        public double CrosswindKts { get; set; }
    }

    public class CloudLayerDto
    {
        public string Coverage { get; set; } = string.Empty;

        /// <summary>Significant cloud type ("cb", "tcu"); null when not reported.</summary>
        public string? Type { get; set; }

        public double AltitudeFt { get; set; }

        public bool Ceiling { get; set; }
    }
}
