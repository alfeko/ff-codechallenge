import { Component, EventEmitter, Input, Output } from '@angular/core';
import { zuluTime } from '../weather/zulu';

/**
 * Zulu time picker for narrowing a forecast to one moment. Reusable: it owns only the
 * input, and emits the chosen time so whichever view hosts it decides what to filter.
 */
@Component({
  selector: 'app-forecast-time-filter',
  standalone: false,
  styleUrl: './forecast-time-filter.css',
  templateUrl: './forecast-time-filter.html',
})
export class ForecastTimeFilter {
  @Input() validFrom: string | null = null;

  @Input() validTo: string | null = null;

  /** 'HH:mm' in Zulu, or null for "show the whole forecast". */
  @Output() timeChange = new EventEmitter<string | null>();

  public time = '';

  get range(): string {
    const from = zuluTime(this.validFrom);
    const to = zuluTime(this.validTo);

    return from && to ? `${from} – ${to}` : '';
  }

  onTimeChange(value: string) {
    this.time = value;
    this.timeChange.emit(value || null);
  }

  showAll() {
    this.time = '';
    this.timeChange.emit(null);
  }
}
