import { Component, Input } from '@angular/core';
import { MetarDto } from '../weather/weather.models';

/** Presentational: renders a METAR. Used by both the full view and the METAR view. */
@Component({
  selector: 'app-current-conditions',
  standalone: false,
  templateUrl: './current-conditions.html',
})
export class CurrentConditions {
  @Input({ required: true }) metar!: MetarDto;
}
