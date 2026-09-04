import { Component, Input } from '@angular/core';
import { RunwayDto } from '../weather/weather.models';

@Component({
  selector: 'app-runway-components',
  standalone: false,
  styleUrl: './runway-components.css',
  templateUrl: './runway-components.html',
})
export class RunwayComponents {
  /**
   * The UI shows whole knots, so anything below half a knot renders as "0". Matching the
   * threshold to the pipe's rounding keeps the number and the wording consistent, and
   * stops floating-point residue (a direct tailwind yields a crosswind of ~1e-15) from
   * being labelled "from the right".
   */
  private static readonly NEGLIGIBLE_KTS = 0.5;

  @Input({ required: true }) runways: RunwayDto[] = [];

  /** One-line rows for a forecast period, instead of labelled blocks. */
  @Input() compact = false;

  /** Absolute value for display; the sign is expressed in words instead. */
  magnitude(value: number): number {
    return Math.abs(value);
  }

  /** Row label: the sign decides whether this component helps or hurts. */
  headwindLabel(runway: RunwayDto): string {
    return runway.headwindKts < 0 ? 'Tailwind' : 'Headwind';
  }

  /** Muted qualifier after the crosswind value; empty when it rounds to zero. */
  crosswindSide(runway: RunwayDto): string {
    if (Math.abs(runway.crosswindKts) < RunwayComponents.NEGLIGIBLE_KTS) {
      return '';
    }

    return runway.crosswindKts > 0 ? 'from the right' : 'from the left';
  }
}
