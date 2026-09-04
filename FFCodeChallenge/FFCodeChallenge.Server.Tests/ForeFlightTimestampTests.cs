using FFCodeChallenge.Server.Services;

namespace FFCodeChallenge.Server.Tests
{
    /// <summary>
    /// ForeFlight sends "+0000" (ISO 8601 basic), which System.Text.Json rejects, and a
    /// timezone mistake here is silently wrong rather than visibly broken -- so the parsed
    /// result is pinned to UTC for every shape of input we expect to see.
    /// </summary>
    public class ForeFlightTimestampTests
    {
        [Theory]
        [InlineData("2026-09-04T09:09:00+0000", "2026-09-04T09:09:00Z")] // ForeFlight's basic offset
        [InlineData("2026-09-04T11:09:00+0200", "2026-09-04T09:09:00Z")] // normalised to UTC
        [InlineData("2026-09-04T09:09:00Z", "2026-09-04T09:09:00Z")]
        [InlineData("2026-09-04T09:09:00", "2026-09-04T09:09:00Z")] // no offset: UTC, not server-local
        public void ParsesForeFlightTimestampsAsUtc(string input, string expectedUtc)
        {
            var parsed = ForeFlightTimestamp.Parse(input);

            Assert.NotNull(parsed);
            Assert.Equal(TimeSpan.Zero, parsed!.Value.Offset);
            Assert.Equal(DateTimeOffset.Parse(expectedUtc), parsed.Value);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("not a date")]
        public void ReturnsNullForUnusableValues(string? input)
        {
            Assert.Null(ForeFlightTimestamp.Parse(input));
        }
    }
}
