using FFCodeChallenge.Server.Services;

namespace FFCodeChallenge.Server.Tests
{
    /// <summary>
    /// Guards the wind component maths for the assumed runway 22 (heading 220).
    /// Headwind:  positive = headwind, negative = tailwind.
    /// Crosswind: positive = from the pilot's right, negative = from the left.
    /// </summary>
    public class RunwayWindCalculatorTests
    {
        private const int Runway22Heading = 220;

        [Theory]
        // windFrom, speedKts, expectedHeadwind, expectedCrosswind
        [InlineData(220, 10, 10.0, 0.0)] // straight down the runway
        [InlineData(40, 10, -10.0, 0.0)] // from directly behind: a tailwind
        [InlineData(310, 10, 0.0, 10.0)] // straight across, from the right
        [InlineData(130, 10, 0.0, -10.0)] // straight across, from the left
        [InlineData(190, 6, 5.196152, -3.0)] // 30 degrees off, to the left
        public void CalculatesHeadwindAndCrosswindForRunway22(
            int windDirection,
            double windSpeedKts,
            double expectedHeadwind,
            double expectedCrosswind)
        {
            var (headwind, crosswind) = RunwayWindCalculator.Calculate(
                windSpeedKts, windDirection, Runway22Heading);

            Assert.Equal(expectedHeadwind, headwind, 6);
            Assert.Equal(expectedCrosswind, crosswind, 6);
        }
    }
}
