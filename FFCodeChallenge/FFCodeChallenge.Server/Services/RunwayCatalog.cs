namespace FFCodeChallenge.Server.Services
{
    /// <summary>
    /// The ForeFlight weather API does not return runways, so for this project we
    /// assume every airport has the same runway set. Add entries here to extend it;
    /// each one automatically gets its own wind components.
    /// </summary>
    public static class RunwayCatalog
    {
        public sealed record Runway(string Designator, int HeadingDegrees);

        public static readonly IReadOnlyList<Runway> AssumedRunways =
        [
            new Runway("22", 220)
            // e.g. new Runway("04", 40) for the reciprocal end
        ];
    }
}
