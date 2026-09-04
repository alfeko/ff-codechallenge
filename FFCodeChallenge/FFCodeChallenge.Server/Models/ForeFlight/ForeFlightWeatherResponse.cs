namespace FFCodeChallenge.Server.Models.ForeFlight
{
    public class ForeFlightWeatherResponse
    {
        public ForeFlightReport? Report { get; set; }
    }

    public class ForeFlightReport
    {
        public ForeFlightConditions? Conditions { get; set; }

        /// <summary>Absent for airports that publish a METAR but no TAF.</summary>
        public ForeFlightForecast? Forecast { get; set; }
    }

    /// <summary>The TAF.</summary>
    public class ForeFlightForecast
    {
        /// <summary>Raw TAF string, carried through to the DTO but not otherwise used.</summary>
        public string? Text { get; set; }

        /// <summary>String, not DateTimeOffset -- see <see cref="Services.ForeFlightTimestamp"/>.</summary>
        public string? DateIssued { get; set; }

        public ForeFlightPeriod? Period { get; set; }

        public List<ForeFlightForecastConditions> Conditions { get; set; } = [];
    }

    public class ForeFlightPeriod
    {
        public string? DateStart { get; set; }

        public string? DateEnd { get; set; }
    }

    /// <summary>
    /// One TAF change group. Distinct from <see cref="ForeFlightConditions"/>: a forecast
    /// period carries no temperature or pressure, but does have a change indicator and
    /// flight rules. Wind and visibility are genuinely absent on some groups.
    /// </summary>
    public class ForeFlightForecastConditions
    {
        /// <summary>Raw TAF fragment for this group, carried through but not otherwise used.</summary>
        public string? Text { get; set; }

        /// <summary>"Temporary", "40% probability", ... Absent on the prevailing group.</summary>
        public string? Change { get; set; }

        /// <summary>"vfr" | "mvfr" | "ifr" | "lifr". Treated as free text, not an enum.</summary>
        public string? FlightRules { get; set; }

        public ForeFlightPeriod? Period { get; set; }

        public List<ForeFlightCloudLayer> CloudLayers { get; set; } = [];

        /// <summary>Plain-English phrases, e.g. ["moderate rain, thunderstorms"].</summary>
        public List<string> Weather { get; set; } = [];

        /// <summary>Absent entirely on some probability groups.</summary>
        public ForeFlightWind? Wind { get; set; }

        public ForeFlightVisibility? Visibility { get; set; }
    }

    public class ForeFlightConditions
    {
        public double TempC { get; set; }

        public double PressureHg { get; set; }

        public double PressureHpa { get; set; }

        public List<ForeFlightCloudLayer> CloudLayers { get; set; } = [];

        public ForeFlightVisibility? Visibility { get; set; }

        public ForeFlightWind? Wind { get; set; }
    }

    public class ForeFlightVisibility
    {
        public double DistanceSm { get; set; }

        public double DistanceMeter { get; set; }
    }

    public class ForeFlightWind
    {
        public double SpeedKts { get; set; }

        public int Direction { get; set; }
    }

    public class ForeFlightCloudLayer
    {
        public string Coverage { get; set; } = string.Empty;

        /// <summary>Optional significant-cloud type, e.g. "cb" or "tcu".</summary>
        public string? Type { get; set; }

        public double AltitudeFt { get; set; }

        public bool Ceiling { get; set; }
    }
}
