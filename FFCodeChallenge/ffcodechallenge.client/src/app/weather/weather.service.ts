import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AirportWeatherDto, MetarDto, TafDto } from './weather.models';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  /** Everything: current conditions and forecast. */
  getFull(icao: string): Observable<AirportWeatherDto> {
    return this.http.get<AirportWeatherDto>(`/api/weather/${icao}`);
  }

  /** Current conditions only. */
  getMetar(icao: string): Observable<MetarDto> {
    return this.http.get<MetarDto>(`/api/weather/${icao}/metar`);
  }

  /** Forecast only. 404s for airports that publish no TAF. */
  getTaf(icao: string): Observable<TafDto> {
    return this.http.get<TafDto>(`/api/weather/${icao}/taf`);
  }

  /**
   * Shared error wording so the three views cannot drift apart. `missing` describes
   * what specifically was not found, since a 404 means different things per endpoint.
   */
  describeError(response: HttpErrorResponse, icao: string, missing: string): string {
    if (response.status === 400) {
      return 'Enter a 4-letter ICAO code, like EKOD.';
    }

    if (response.status === 404) {
      return missing;
    }

    return 'Could not reach the weather service. Try again in a moment.';
  }
}
