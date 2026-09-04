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

export interface AirportWeatherDto {
  icao: string;
  temperatureC: number;
  pressureHg: number;
  pressureHpa: number;
  visibility: VisibilityDto;
  wind: WindDto;
  cloudLayers: CloudLayerDto[];
}

@Component({
  selector: 'app-airport-weather',
  standalone: false,
  styleUrl: './airport-weather.css',
  templateUrl: './airport-weather.html',
})
export class AirportWeather {
  public icaoCode = '';
  public weather = signal<AirportWeatherDto | null>(null);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

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
