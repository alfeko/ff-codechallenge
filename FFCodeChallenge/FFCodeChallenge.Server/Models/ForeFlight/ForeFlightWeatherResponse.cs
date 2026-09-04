namespace FFCodeChallenge.Server.Models.ForeFlight
{
    public class ForeFlightWeatherResponse
    {
        public ForeFlightReport? Report { get; set; }
    }

    public class ForeFlightReport
    {
        public ForeFlightConditions? Conditions { get; set; }
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

        public double AltitudeFt { get; set; }

        public bool Ceiling { get; set; }
    }
}
