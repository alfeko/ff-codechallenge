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

export interface AirportWeatherDto {
  icao: string;
  temperatureC: number;
  pressureHg: number;
  pressureHpa: number;
  visibility: VisibilityDto;
  wind: WindDto;
  runways: RunwayDto[];
  cloudLayers: CloudLayerDto[];
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

  public icaoCode = '';
  public weather = signal<AirportWeatherDto | null>(null);
  public error = signal<string | null>(null);

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

  getWeather() {
    this.error.set(null);
    this.weather.set(null);

    if (!/^[A-Za-z]{4}$/.test(this.icaoCode)) {
      this.error.set('Enter a 4-letter ICAO code, like EKOD.');
      return;
    }

    this.http.get<AirportWeatherDto>('/api/weather/' + this.icaoCode).subscribe({
      next: (result) => {
        this.weather.set(result);
      },
      error: (response: HttpErrorResponse) => {
        const code = this.icaoCode.toUpperCase();

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
