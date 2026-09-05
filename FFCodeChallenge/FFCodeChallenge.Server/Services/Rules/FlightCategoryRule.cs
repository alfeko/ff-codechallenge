using FFCodeChallenge.Server.Models;

namespace FFCodeChallenge.Server.Services.Rules
{
    /// <summary>
    /// Ordered by severity so the engine can take the worst verdict with Max().
    /// </summary>
    public enum FlightCategory
    {
        Go = 0,
        Maybe = 1,
        NoGo = 2
    }

    /// <summary>What the conditions look like to a rule. Both parts may be absent.</summary>
    public sealed record WeatherSnapshot(
        VisibilityDto? Visibility,
        IReadOnlyList<CloudLayerDto> CloudLayers);

    public sealed record RuleVerdict(FlightCategory Category, string Reason);

    /// <summary>
    /// One condition worth checking. Returning null means "no opinion" -- the rule did
    /// not trigger, which is different from voting Go.
    /// </summary>
    public interface IFlightCategoryRule
    {
        RuleVerdict? Evaluate(WeatherSnapshot snapshot);
    }

    internal static class SignificantCloud
    {
        /// <summary>
        /// Only broken and overcast layers count. Few and scattered do not form a cloud
        /// base you have to get through, so a FEW layer at 800 ft should not ground you.
        /// </summary>
        public static IEnumerable<CloudLayerDto> In(IReadOnlyList<CloudLayerDto> layers)
        {
            return layers.Where(layer =>
                string.Equals(layer.Coverage, "bkn", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(layer.Coverage, "ovc", StringComparison.OrdinalIgnoreCase));
        }
    }
}
