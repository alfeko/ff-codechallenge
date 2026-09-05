import { Component, Input } from '@angular/core';
import { FlightCategoryDto } from '../weather/weather.models';

/**
 * Go / Maybe / NO-GO badge. Reusable: shown against current conditions and against
 * each forecast period, so you can see it is fine now but NO-GO during a later TEMPO.
 */
@Component({
  selector: 'app-flight-category',
  standalone: false,
  styleUrl: './flight-category.css',
  templateUrl: './flight-category.html',
})
export class FlightCategory {
  @Input({ required: true }) category!: FlightCategoryDto;

  /** Smaller badge, with reasons hidden, for the dense forecast rows. */
  @Input() compact = false;

  private static readonly LABELS: Record<string, string> = {
    go: 'GO',
    maybe: 'MAYBE',
    'no-go': 'NO-GO',
  };

  get label(): string {
    return FlightCategory.LABELS[this.category.category] ?? this.category.category.toUpperCase();
  }

  /**
   * Allow-listed so an unexpected value from the API cannot inject a class name, and
   * still renders readably in the default styling.
   */
  get badgeClass(): string {
    const known = ['go', 'maybe', 'no-go'].includes(this.category.category);

    return known ? `badge cat-${this.category.category}` : 'badge';
  }
}
