import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { loadWeatherOnIcaoChange } from '../weather/load-weather';
import { AirportWeatherDto } from '../weather/weather.models';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-full-view',
  standalone: false,
  templateUrl: './full-view.html',
})
export class FullView {
  private readonly route = inject(ActivatedRoute);
  private readonly weather = inject(WeatherService);

  protected readonly state = loadWeatherOnIcaoChange<AirportWeatherDto>(
    this.route,
    this.weather,
    (icao) => this.weather.getFull(icao),
    (icao) => `No report found for ${icao}. Check the code and try again.`,
  );
}
