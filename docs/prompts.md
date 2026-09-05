# Task 1 prompts:

_project scaffolded with Visual StudioY without any prompts_

 > (plan mode) Plan and implement the following feature: The user should be able to enter a valid 4 letter ICAO airport code, for which it should show the weather for the given airport. Create a REST endpoint for this, which should call this api: https://api.foreflight.com/weather/report/{ICAO} with the header x-foreflight-odense=true. Also create a DTO with the important properties, which are as follows: visibility, temperature, pressure, wind conditions (speed and direction), cloud layers. Here's an example of what the foreflight endpoint returns, all the important information is in the report.conditions object: [eksempel af kald fra api'et, klippet ud her]

>   User answered Claude's questions:
> * Should this feature include a frontend UI (Angular form to enter the ICAO code and display the weather), or just the backend REST endpoint + DTO? → Full stack (Recommended)
> *  Where should the ForeFlight API base URL and the x-foreflight-odense header value live? → appsettings.json (Recommended)
> *  How should invalid ICAO codes (not exactly 4 letters) be handled? → 400 Bad Request with validation (Recommended)

> It all works now but it's quite ugly, can you pretty it up a bit without overdoing it? Just make it fairly simple but nice to look at

# Task 2 prompts:

_for det meste udført på forhånd, men jeg har flyttet headeren ind i appsettings_

> The header x-foreflight-odense=true in @..\FFCodeChallenge.Server\Services\ForeFlightWeatherClient.cs is considered an api key. Please move it to appsettings.json for easy maintainability

# Task 3 prompts:

> (plan mode) Now let's plan a new feature. We need to be able to calculate Headwind (strength of the wind directly against us, looking down the runway) and Crosswind (strength of the wind from the side, looking down the runway) for takeoff and landing. Headwind is speed•cos(delta) and crosswind is speed•sin(delta). Delta is wind direction - runway direction. For the sake of this project, since we cannot retrieve runways from the api, we will assume every airport has a Runway 22, direction of 220 degrees. So ensure that the DTO returns a list of runways, and for now we will add a hardcoded runway in the backend, before returning the values from the foreflight api. And for that runway, add the calculated values of headwind and crosswind in the DTOs

> Considering we've introduced important calculation now, for headwind and crosswinds, please create simple tests for the backend part of this to ensure we don't accidentally mess up the calculation in the future

# Task 4 prompts:

> (plan mode) Now let's add forecast data. Forecast data is included in the foreflight api endpoint, in the report.forecast object. Disregard the text property, here's an example of what the forecast response looks like: [klippet ud]

> User answered Claude's questions:
>* Should each forecast period also get the runway 22 headwind/crosswind calculation, reusing the existing RunwayWindCalculator? → Yes, per period (Recommended)
>* Should the forecast show in the Angular UI, or backend only for now? → Full stack (Recommended)
>* How much detail per forecast period in the UI? Your sample has 4 periods, each with visibility, wind, weather, clouds and flight rules. → Compact rows (Recommended)

note: plan mode fanger en udfordring mellem datoformater, hvor API'et svarer i ISO 8601, hvilket vil resultere i en JsonException hvis vi mapper til DateTime i stedet for DateTimeOffset.

>  ⚠ The timestamp trap — read this first
> 
>ForeFlight sends "2026-09-04T09:09:00+0000": an ISO 8601 basic offset, no colon. System.Text.Json only accepts the extended profile, whose offset grammar is documented as ('+'/'-')HH':'mm — colon mandatory (Microsoft Learn). Non-conforming input throws JsonException.
>
> Declaring these as DateTimeOffset on the wire model would break the entire feature set, not just the forecast — the exception fires inside ReadFromJsonAsync<ForeFlightWeatherResponse>, which parses the whole payload, so current conditions die too. And WeatherController catches only HttpRequestException, so it escapes as an unhandled 500.
>
> **Fix**: keep timestamps as string? on the ForeFlight wire models and convert in the mapping layer via a new Services/ForeFlightTimestamp.cs

# Task 5 prompts:

> Create 2 second delay in the backend for every call in the endpoint calls to the foreflight api, but add a 5 minute cache on the endpoints, to demonstrate a slow endpoint for the first call but an immediate cache hit on the second call. Make it in-memory caching via the OutputCaching middleware, and make a FiveMinutesCache policy.

# Task 6 prompts:

> Now create two new views for airports, one that shows only METAR (current conditions) and one that only shows TAF (forecast). As the backend currently delivers a full payload every time, create new endpoints for both METAR only and TAF only views. But we still want to keep the current page that shows everything. Split up the current frontend into smaller reusable components, as everything lives inside of a single component now. Introduce the ICAO code to the routing, create routes like weather/{ICAO} / (for the full page), weather/{ICAO}/metar and weather/{ICAO}/taf. Make it easy to switch betwen full view, taf and metar, and update the routing based on the view.

# Task 7 prompts:

> Implement this new feature: add an time input so we can get a weather forecast for an aiport based on the specific time. Also add visual warnings based on these conditions: tailwind > 0, crosswind > 15, headwind > 50.

# Task 8 prompts:

_der bliver allerede taget højde for overlappende tidsintervaller_

# Task 9 prompts:

>  Extend the application with these 3 categories for the weather, based on the visibility and clouds - "GO", "Maybe" and "NO-GO". Rules for NO-GO is as follows: clouds in an altitude of < 1000 or visibility < 1500 ft. If cloud is an altitude of < 3000 ft or visibility is < 5km, then it's Maybe. Otherwise it's go. Make a rule engine for this in the backend and expose it via the api. Make it visibly clear in the frontend