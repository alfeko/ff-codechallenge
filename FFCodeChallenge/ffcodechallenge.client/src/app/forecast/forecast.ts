import { Component, Input, signal } from '@angular/core';
import { periodsAt, resolveInstant } from '../weather/period-filter';
import { ForecastPeriodDto, TafDto } from '../weather/weather.models';
import { zuluTime } from '../weather/zulu';

/**
 * Presentational: renders a TAF. Used by both the full view and the TAF view, so the
 * time filter living here means both get it without either knowing about it.
 */
@Component({
  selector: 'app-forecast',
  standalone: false,
  styleUrl: './forecast.css',
  templateUrl: './forecast.html',
})
export class Forecast {
  @Input({ required: true }) taf!: TafDto;

  /** 'HH:mm' Zulu, or null for the whole forecast. */
  protected readonly selectedTime = signal<string | null>(null);

  /** True when a time was chosen but falls outside the TAF's validity window. */
  get outsideWindow(): boolean {
    const time = this.selectedTime();

    return time !== null && resolveInstant(time, this.taf) === null;
  }

  get visiblePeriods(): ForecastPeriodDto[] {
    const time = this.selectedTime();

    if (time === null) {
      return this.taf.periods;
    }

    const instant = resolveInstant(time, this.taf);

    return instant === null ? [] : periodsAt(this.taf.periods, instant);
  }

  zulu(value: string | null): string {
    return zuluTime(value);
  }

  onTimeChange(time: string | null) {
    this.selectedTime.set(time);
  }
}
