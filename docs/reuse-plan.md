# Reuse Plan

First we need to identify what the main core components that make another team could want to reuse, and for that I have singled out:

* FlightCategoryEngine
    * The engine that calculates the go, no-go and maybe categories of a given weather condition of forecast.
* RunwayWindCalculator
    * The calculator which reponsibility is to calculate the crosswind and headwind/tailwind of a given runway.

The FlightCategoryEngine itself is luckily already DI friendly and a user can easily add or remove rules from the engine, enhancing the ease of reusability for the engine itself. I don't see a need to rewrite the Engine.

The RunwayWindCalculator should also be kept as is, it's a fairly simple static class with nothing more for it than a few calculations. Theoretically could be very easily rewritten manually, but let's consider this class could be used as a single source of truth, to ensure we don't reinvent the wheel and also ensure we don't need to rethink the maths every time we implement it.

We could expose everything as REST services, but that would create a constraint to our service. Zero work for them but creates quite a coupling to us. Instead I would extract the services to a library, which we could use to create a NuGet Package, that could be easily integrated into other projects.

One issue we have now is that everything lives inside of a single Server project. I would consider restructuring the project to move to an Onion-style architectural pattern, with a Web, Infrastructure, Application and Domain project, where I'd place the FlightCategoryEngine and RunwayWindCalculator into the Domain project.

We would also have to modify our components a bit, we have a few hardcoded assumed values that should be changed to overridable defaults. For example the LowCeilingRule is hardcoded to 1000 ft, but should be made an overridable default value instead, in case another team has a different requirement.

From there on, we're in a state where we can expose the logic to another team via a Nuget Package.