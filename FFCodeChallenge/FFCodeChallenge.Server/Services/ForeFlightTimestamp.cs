using System.Globalization;

namespace FFCodeChallenge.Server.Services
{
    /// <summary>
    /// ForeFlight sends ISO 8601 *basic* offsets ("2026-09-04T09:09:00+0000"), but
    /// System.Text.Json only parses the *extended* profile, where the offset must be
    /// "Z" or "(+/-)HH:mm" WITH the colon. Deserialising straight into DateTimeOffset
    /// therefore throws a JsonException and takes the whole payload -- the current
    /// conditions included -- down with it. So the ForeFlight wire models keep these
    /// as strings and we convert here, where a bad value degrades to null instead.
    ///
    /// AssumeUniversal|AdjustToUniversal (NOT RoundtripKind): if ForeFlight ever omits
    /// the offset, RoundtripKind silently applies the deployment SERVER's local offset,
    /// which would shift every reported time by the host machine's timezone. Everything
    /// here comes back normalised to UTC, which is what aviation times mean.
    /// </summary>
    public static class ForeFlightTimestamp
    {
        private const DateTimeStyles Styles =
            DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal;

        public static DateTimeOffset? Parse(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, Styles, out var parsed)
                ? parsed
                : null;
        }
    }
}
