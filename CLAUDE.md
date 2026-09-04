# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

.NET 10 ASP.NET Core Web API backend (`FFCodeChallenge.Server`) with an Angular 22 SPA frontend (`ffcodechallenge.client`), wired together via `Microsoft.AspNetCore.SpaProxy`. This is a freshly scaffolded project (no custom business logic yet beyond the default templates).

## Repository structure

- `FFCodeChallenge/FFCodeChallenge.slnx` — solution file referencing both projects.
- `FFCodeChallenge/FFCodeChallenge.Server/` — ASP.NET Core Web API (net10.0). Controllers live in `Controllers/`.
- `FFCodeChallenge/ffcodechallenge.client/` — Angular CLI app (v22), source in `src/app/`.

## Commands

### Backend (from `FFCodeChallenge/FFCodeChallenge.Server/`)

- `dotnet build` — build the API project.
- `dotnet run` — run the API (also starts the Angular dev server via SpaProxy). HTTPS profile: `https://localhost:7283`, HTTP: `http://localhost:5150`.
- `dotnet test` — run tests (no test project exists yet; add one under the solution before this is usable).

Run from the repo root against the solution instead if preferring solution-wide commands: `dotnet build FFCodeChallenge/FFCodeChallenge.slnx`.

### Frontend (from `FFCodeChallenge/ffcodechallenge.client/`)

- `npm start` — serve the Angular app standalone (runs `aspnetcore-https` prestart, then `ng serve` with the ASP.NET dev cert via the `start:windows`/`start:default` script for the current OS).
- `npm run build` — production build (`ng build`), output to `dist/`.
- `npm run watch` — development build with `--watch`.
- `npm test` — run unit tests via Vitest (`ng test`).
- To run a single test file/spec, use Angular CLI's underlying test runner filtering, e.g. `ng test --include='**/app.spec.ts'`.

Normally you don't run the Angular app standalone in development — `dotnet run` on the server project launches it automatically through SpaProxy (see `SpaProxyServerUrl`/`SpaProxyLaunchCommand` in `FFCodeChallenge.Server.csproj`).

## Architecture notes

- The server serves the built Angular app as static files in production (`app.MapStaticAssets()` + `app.MapFallbackToFile("/index.html")` in `Program.cs`), and falls back to the SPA proxy in development.
- API controllers use the standard ASP.NET Core `ControllerBase` pattern (see `Controllers/WeatherForecastController.cs` for the template example); OpenAPI is exposed via `app.MapOpenApi()` in Development only.
- The Angular app currently uses NgModules (`app-module.ts`, `app-routing-module.ts`), not standalone components — follow this convention when adding new modules/components unless deliberately migrating.
- Formatting: Angular project uses Prettier (`printWidth: 100`, single quotes, Angular parser for `.html` files) and a 2-space `.editorconfig`.
