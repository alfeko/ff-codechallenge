namespace FFCodeChallenge.Server.Services.Rules
{
    /// <summary>A broken or overcast layer below 1000 ft grounds you.</summary>
    public sealed class LowCeilingRule : IFlightCategoryRule
    {
        public const double LimitFt = 1000;

        public RuleVerdict? Evaluate(WeatherSnapshot snapshot)
        {
            var lowest = SignificantCloud.In(snapshot.CloudLayers)
                .Where(layer => layer.AltitudeFt < LimitFt)
                .OrderBy(layer => layer.AltitudeFt)
                .FirstOrDefault();

            return lowest is null
                ? null
                : new RuleVerdict(
                    FlightCategory.NoGo,
                    $"{lowest.Coverage.ToUpperInvariant()} cloud at {lowest.AltitudeFt:0} ft, below {LimitFt:0} ft");
        }
    }

    /// <summary>A broken or overcast layer below 3000 ft is marginal.</summary>
    public sealed class MarginalCeilingRule : IFlightCategoryRule
    {
        public const double LimitFt = 3000;

        public RuleVerdict? Evaluate(WeatherSnapshot snapshot)
        {
            var lowest = SignificantCloud.In(snapshot.CloudLayers)
                .Where(layer => layer.AltitudeFt < LimitFt)
                .OrderBy(layer => layer.AltitudeFt)
                .FirstOrDefault();

            return lowest is null
                ? null
                : new RuleVerdict(
                    FlightCategory.Maybe,
                    $"{lowest.Coverage.ToUpperInvariant()} cloud at {lowest.AltitudeFt:0} ft, below {LimitFt:0} ft");
        }
    }
}
