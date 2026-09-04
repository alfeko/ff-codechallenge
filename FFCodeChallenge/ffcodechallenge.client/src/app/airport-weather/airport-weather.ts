import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';

export interface VisibilityDto {
  distanceSm: number;
  distanceMeters: number;
}

export interface WindDto {
  speedKts: number;
  directionDegrees: number;
}

export interface CloudLayerDto {
  coverage: string;
  /** Significant cloud type ('cb', 'tcu'); null when not reported. */
  type: string | null;
  altitudeFt: number;
  ceiling: boolean;
}

export interface RunwayDto {
  designator: string;
  headingDegrees: number;
  /** Positive = headwind, negative = tailwind. */
  headwindKts: number;
  /** Positive = wind from the pilot's right, negative = from the left. */
  crosswindKts: number;
}

export interface ForecastPeriodDto {
  /** Raw TAF fragment. Carried for reference; not rendered. */
  text: string | null;
  /** Change group; null on the prevailing period. */
  change: string | null;
  /** 'vfr' | 'mvfr' | 'ifr' | 'lifr', or null. */
  flightRules: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  visibility: VisibilityDto | null;
  wind: WindDto | null;
  runways: RunwayDto[];
  cloudLayers: CloudLayerDto[];
  weather: string[];
}

export interface ForecastDto {
  /** Raw TAF string. Carried for reference; not rendered. */
  text: string | null;
  dateIssued: string | null;
  validFrom: string | null;
  validTo: string | null;
  periods: ForecastPeriodDto[];
}

export interface AirportWeatherDto {
  icao: string;
  temperatureC: number;
  pressureHg: number;
  pressureHpa: number;
  visibility: VisibilityDto;
  wind: WindDto;
  runways: RunwayDto[];
  cloudLayers: CloudLayerDto[];
  forecast: ForecastDto | null;
}

@Component({
  selector: 'app-airport-weather',
  standalone: false,
  styleUrl: './airport-weather.css',
  templateUrl: './airport-weather.html',
})
export class AirportWeather {
  /**
   * The UI shows whole knots, so anything below half a knot renders as "0".
   * Matching the threshold to the pipe's rounding keeps the number and the
   * wording consistent, and stops floating-point residue (a direct tailwind
   * yields a crosswind of ~1e-15) from being labelled "from the right".
   */
  private static readonly NEGLIGIBLE_KTS = 0.5;

  private static readonly FLIGHT_RULES = ['vfr', 'mvfr', 'ifr', 'lifr'];

  public icaoCode = '';
  public weather = signal<AirportWeatherDto | null>(null);
  public error = signal<string | null>(null);

  /**
   * The ICAO code currently being fetched, or null when idle. One signal covers both
   * "is a request in flight" and "which airport", so the two can never disagree.
   * Must be a signal: the app is zoneless, so a plain field mutated inside the
   * subscribe callback would never trigger a re-render.
   */
  public pending = signal<string | null>(null);

  constructor(private http: HttpClient) {}

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
    if (Math.abs(runway.crosswindKts) < AirportWeather.NEGLIGIBLE_KTS) {
      return '';
    }

    return runway.crosswindKts > 0 ? 'from the right' : 'from the left';
  }

  /**
   * Aviation times are Zulu. Formatted from the ISO string rather than with the `date`
   * pipe, whose timezone is the THIRD argument -- omit it and the pipe silently renders
   * browser-local time, so an 0900Z period reads as 11:00 in Copenhagen with no visual
   * cue that it is wrong. This is deterministic and testable instead.
   */
  zuluTime(value: string | null): string {
    if (!value) {
      return '';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().slice(11, 16);
  }

  /** Compact validity range; degrades to whichever end is known. */
  periodRange(period: ForecastPeriodDto): string {
    const start = this.zuluTime(period.periodStart);
    const end = this.zuluTime(period.periodEnd);

    if (start && end) {
      return `${start} – ${end}`;
    }

    return start || end || 'Time not given';
  }

  /** The prevailing group carries no change indicator; everything else names its own. */
  changeLabel(period: ForecastPeriodDto): string {
    return period.change ?? 'Prevailing';
  }

  /**
   * Allow-listed so an unexpected API value cannot inject an arbitrary class name, and
   * so an unknown rule still renders its text in the default colour.
   */
  flightRulesClass(period: ForecastPeriodDto): string {
    const rules = (period.flightRules ?? '').toLowerCase();

    return AirportWeather.FLIGHT_RULES.includes(rules)
      ? `flight-rules fr-${rules}`
      : 'flight-rules';
  }

  getWeather() {
    this.error.set(null);
    this.weather.set(null);

    if (!/^[A-Za-z]{4}$/.test(this.icaoCode)) {
      this.error.set('Enter a 4-letter ICAO code, like EKOD.');
      return;
    }

    const code = this.icaoCode.toUpperCase();
    this.pending.set(code);

    // Send the normalised code: the server caches per URL, so "ekod" and "EKOD" would
    // otherwise occupy two separate cache entries for the same airport.
    this.http.get<AirportWeatherDto>('/api/weather/' + code).subscribe({
      next: (result) => {
        this.pending.set(null);
        this.weather.set(result);
      },
      error: (response: HttpErrorResponse) => {
        this.pending.set(null);

        if (response.status === 400) {
          this.error.set('Enter a 4-letter ICAO code, like EKOD.');
        } else if (response.status === 404) {
          this.error.set(`No report found for ${code}. Check the code and try again.`);
        } else {
          this.error.set('Could not reach the weather service. Try again in a moment.');
        }
      },
    });
  }
}
