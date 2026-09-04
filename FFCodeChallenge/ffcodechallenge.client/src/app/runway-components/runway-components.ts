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

  /** Operational limits. Any tailwind at all is worth flagging on takeoff or landing. */
  private static readonly CROSSWIND_LIMIT_KTS = 15;
  private static readonly HEADWIND_LIMIT_KTS = 50;

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

  /**
   * Conditions worth flagging. Each is rendered as text as well as colour, so the
   * warning never depends on colour alone.
   */
  warnings(runway: RunwayDto): string[] {
    const flags: string[] = [];

    // Any tailwind is a warning: it lengthens the takeoff roll and the landing distance.
    // Guarded by the display threshold so a -1e-15 rounding artefact can't trip it.
    if (runway.headwindKts < -RunwayComponents.NEGLIGIBLE_KTS) {
      flags.push(`Tailwind ${this.round(Math.abs(runway.headwindKts))} kt`);
    }

    // Absolute: 20 kt from the left is as much of a problem as 20 kt from the right.
    if (Math.abs(runway.crosswindKts) > RunwayComponents.CROSSWIND_LIMIT_KTS) {
      flags.push(`Crosswind over ${RunwayComponents.CROSSWIND_LIMIT_KTS} kt`);
    }

    if (runway.headwindKts > RunwayComponents.HEADWIND_LIMIT_KTS) {
      flags.push(`Headwind over ${RunwayComponents.HEADWIND_LIMIT_KTS} kt`);
    }

    return flags;
  }

  hasWarning(runway: RunwayDto): boolean {
    return this.warnings(runway).length > 0;
  }

  private round(value: number): number {
    return Math.round(value);
  }
}
