namespace FFCodeChallenge.Server
{
    /// <summary>
    /// Names of the output cache policies registered in Program.cs. Kept as constants
    /// because the policy name is matched by string at request time -- a typo in the
    /// attribute would fail at runtime rather than at compile time.
    /// </summary>
    public static class OutputCachePolicies
    {
        public const string FiveMinutesCache = "FiveMinutesCache";
    }
}
