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

        public List<CloudLayerDto> CloudLayers { get; set; } = [];
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

    public class CloudLayerDto
    {
        public string Coverage { get; set; } = string.Empty;

        public double AltitudeFt { get; set; }

        public bool Ceiling { get; set; }
    }
}
