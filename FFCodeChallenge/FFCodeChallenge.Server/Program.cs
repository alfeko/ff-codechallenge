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
    client.DefaultRequestHeaders.Add(ForeFlightWeatherClient.HeaderName, ForeFlightWeatherClient.HeaderValue);
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

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
