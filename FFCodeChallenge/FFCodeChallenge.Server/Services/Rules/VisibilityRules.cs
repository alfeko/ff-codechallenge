namespace FFCodeChallenge.Server.Services.Rules
{
    /// <summary>Visibility under 1500 m grounds you.</summary>
    public sealed class LowVisibilityRule : IFlightCategoryRule
    {
        public const double LimitMeters = 1500;

        public RuleVerdict? Evaluate(WeatherSnapshot snapshot)
        {
            var visibility = snapshot.Visibility;

            return visibility is not null && visibility.DistanceMeters < LimitMeters
                ? new RuleVerdict(
                    FlightCategory.NoGo,
                    $"Visibility {visibility.DistanceMeters:0} m, below {LimitMeters:0} m")
                : null;
        }
    }

    /// <summary>Visibility under 5 km is marginal.</summary>
    public sealed class MarginalVisibilityRule : IFlightCategoryRule
    {
        public const double LimitMeters = 5000;

        public RuleVerdict? Evaluate(WeatherSnapshot snapshot)
        {
            var visibility = snapshot.Visibility;

            return visibility is not null && visibility.DistanceMeters < LimitMeters
                ? new RuleVerdict(
                    FlightCategory.Maybe,
                    $"Visibility {visibility.DistanceMeters:0} m, below {LimitMeters:0} m")
                : null;
        }
    }
}
