import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { loadWeatherOnIcaoChange } from '../weather/load-weather';
import { MetarDto } from '../weather/weather.models';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-metar-view',
  standalone: false,
  templateUrl: './metar-view.html',
})
export class MetarView {
  private readonly route = inject(ActivatedRoute);
  private readonly weather = inject(WeatherService);

  protected readonly state = loadWeatherOnIcaoChange<MetarDto>(
    this.route,
    this.weather,
    (icao) => this.weather.getMetar(icao),
    (icao) => `No report found for ${icao}. Check the code and try again.`,
  );
}
