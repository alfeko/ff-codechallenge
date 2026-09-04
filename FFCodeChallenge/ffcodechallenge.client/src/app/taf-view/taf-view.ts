import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { loadWeatherOnIcaoChange } from '../weather/load-weather';
import { TafDto } from '../weather/weather.models';
import { WeatherService } from '../weather/weather.service';

@Component({
  selector: 'app-taf-view',
  standalone: false,
  templateUrl: './taf-view.html',
})
export class TafView {
  private readonly route = inject(ActivatedRoute);
  private readonly weather = inject(WeatherService);

  protected readonly state = loadWeatherOnIcaoChange<TafDto>(
    this.route,
    this.weather,
    (icao) => this.weather.getTaf(icao),
    // The TAF endpoint 404s both for an unknown airport and for a known one with no
    // forecast, and the response cannot tell them apart -- so the wording covers both.
    (icao) => `No forecast issued for ${icao}.`,
  );
}
