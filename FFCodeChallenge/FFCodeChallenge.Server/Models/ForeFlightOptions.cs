namespace FFCodeChallenge.Server.Models
{
    public class ForeFlightOptions
    {
        public string BaseUrl { get; set; } = string.Empty;

        /// <summary>
        /// Name of the header the ForeFlight API key is sent in.
        /// </summary>
        public string ApiKeyHeader { get; set; } = string.Empty;

        /// <summary>
        /// API key sent to the ForeFlight API on every request.
        /// </summary>
        public string ApiKey { get; set; } = string.Empty;
    }
}
