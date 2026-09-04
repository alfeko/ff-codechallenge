namespace FFCodeChallenge.Server.Services
{
    /// <summary>
    /// Wind component maths for a single runway.
    ///
    /// Conventions:
    ///  - windDirectionDegrees is the direction the wind blows FROM (METAR convention).
    ///  - runwayHeadingDegrees is the direction the aircraft points when using that runway.
    ///  - delta = wind direction - runway heading.
    ///  - Headwind:  positive = headwind, negative = tailwind.
    ///  - Crosswind: positive = wind from the pilot's right, negative = from the left.
    ///
    /// delta is deliberately NOT normalised: cos/sin are 360-degree periodic, so
    /// delta = 340 and delta = -20 give identical results. Normalising would add a
    /// sign trap, because C# '%' keeps the sign of the dividend (-30 % 360 == -30).
    ///
    /// Caveat: runway designators are magnetic and METAR wind directions are true,
    /// so these components ignore local magnetic variation. Acceptable for this project.
    /// </summary>
    public static class RunwayWindCalculator
    {
        public static (double HeadwindKts, double CrosswindKts) Calculate(
            double windSpeedKts,
            int windDirectionDegrees,
            int runwayHeadingDegrees)
        {
            // Math.Cos/Math.Sin take RADIANS, not degrees.
            var deltaRadians = double.DegreesToRadians(windDirectionDegrees - runwayHeadingDegrees);

            return (
                windSpeedKts * Math.Cos(deltaRadians),
                windSpeedKts * Math.Sin(deltaRadians));
        }
    }
}
