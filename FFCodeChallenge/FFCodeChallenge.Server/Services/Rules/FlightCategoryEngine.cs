using FFCodeChallenge.Server.Models;

namespace FFCodeChallenge.Server.Services.Rules
{
    /// <summary>
    /// Runs every registered rule and takes the most severe verdict. Adding a condition
    /// means writing one IFlightCategoryRule and registering it -- nothing here changes.
    /// </summary>
    public sealed class FlightCategoryEngine
    {
        private readonly IReadOnlyList<IFlightCategoryRule> _rules;

        public FlightCategoryEngine(IEnumerable<IFlightCategoryRule> rules)
        {
            _rules = [.. rules];
        }

        public FlightCategoryDto Assess(VisibilityDto? visibility, IReadOnlyList<CloudLayerDto> cloudLayers)
        {
            var snapshot = new WeatherSnapshot(visibility, cloudLayers);

            var verdicts = _rules
                .Select(rule => rule.Evaluate(snapshot))
                .OfType<RuleVerdict>()
                .ToList();

            if (verdicts.Count == 0)
            {
                return new FlightCategoryDto { Category = Name(FlightCategory.Go) };
            }

            var worst = verdicts.Max(verdict => verdict.Category);

            return new FlightCategoryDto
            {
                Category = Name(worst),

                // Only the reasons that actually drive the outcome. When a low ceiling
                // makes it NO-GO, also listing the marginal-visibility reason is noise.
                Reasons = [.. verdicts.Where(v => v.Category == worst).Select(v => v.Reason)]
            };
        }

        private static string Name(FlightCategory category)
        {
            return category switch
            {
                FlightCategory.NoGo => "no-go",
                FlightCategory.Maybe => "maybe",
                _ => "go"
            };
        }
    }
}
