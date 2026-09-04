import { Component, Input } from '@angular/core';
import { TafDto } from '../weather/weather.models';
import { zuluTime } from '../weather/zulu';

/** Presentational: renders a TAF. Used by both the full view and the TAF view. */
@Component({
  selector: 'app-forecast',
  standalone: false,
  styleUrl: './forecast.css',
  templateUrl: './forecast.html',
})
export class Forecast {
  @Input({ required: true }) taf!: TafDto;

  zulu(value: string | null): string {
    return zuluTime(value);
  }
}
