import { Component, Input } from '@angular/core';
import { ForecastPeriodDto } from '../weather/weather.models';
import { zuluTime } from '../weather/zulu';

/** Presentational: one TAF change group as a compact block. */
@Component({
  selector: 'app-forecast-period',
  standalone: false,
  styleUrl: './forecast-period.css',
  templateUrl: './forecast-period.html',
})
export class ForecastPeriod {
  private static readonly FLIGHT_RULES = ['vfr', 'mvfr', 'ifr', 'lifr'];

  @Input({ required: true }) period!: ForecastPeriodDto;

  /** Compact validity range; degrades to whichever end is known. */
  get range(): string {
    const start = zuluTime(this.period.periodStart);
    const end = zuluTime(this.period.periodEnd);

    if (start && end) {
      return `${start} – ${end}`;
    }

    return start || end || 'Time not given';
  }

  /** The prevailing group carries no change indicator; everything else names its own. */
  get changeLabel(): string {
    return this.period.change ?? 'Prevailing';
  }

  /**
   * Allow-listed so an unexpected API value cannot inject an arbitrary class name, and
   * so an unknown rule still renders its text in the default colour.
   */
  get flightRulesClass(): string {
    const rules = (this.period.flightRules ?? '').toLowerCase();

    return ForecastPeriod.FLIGHT_RULES.includes(rules) ? `flight-rules fr-${rules}` : 'flight-rules';
  }
}
