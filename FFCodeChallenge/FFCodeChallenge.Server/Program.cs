using FFCodeChallenge.Server;
using FFCodeChallenge.Server.Models;
using FFCodeChallenge.Server.Services;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.Configure<ForeFlightOptions>(builder.Configuration.GetSection("ForeFlight"));
builder.Services.AddHttpClient<IForeFlightWeatherClient, ForeFlightWeatherClient>((sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<ForeFlightOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
    client.DefaultRequestHeaders.Add(options.ApiKeyHeader, options.ApiKey);
});

// Output caching stores the finished HTTP response in process memory, so a hit is served
// by the middleware and never reaches the controller -- skipping the ForeFlight call and
// its artificial 2s delay entirely.
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy(OutputCachePolicies.FiveMinutesCache, policy => policy
        .Expire(TimeSpan.FromMinutes(5))

        // Cache per airport. The route value is what distinguishes one lookup from
        // another, so EKOD and KJFK get separate entries rather than sharing one.
        .SetVaryByRouteValue("icaoCode"));
});

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Must come after UseRouting/UseAuthorization, and before the endpoints it caches.
app.UseOutputCache();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
