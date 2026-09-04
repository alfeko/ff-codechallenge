import { HttpErrorResponse } from '@angular/common/http';
import { Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { WeatherService } from './weather.service';

export interface WeatherLoad<T> {
  data: Signal<T | null>;
  error: Signal<string | null>;
  /** The ICAO currently in flight, or null when idle. */
  pending: Signal<string | null>;
}

/**
 * Wires a view container to the :icao route parameter.
 *
 * Two things this exists to get right. First, navigating from /weather/EKOD to
 * /weather/KJFK on the same view REUSES the component -- ngOnInit does not run again --
 * so the code must react to paramMap rather than read a snapshot. Second, the param
 * lives on the parent route (weather/:icao), not on the child.
 *
 * Call this from a field initialiser or constructor: takeUntilDestroyed() needs an
 * injection context, and getting it for free is why there is no manual unsubscribe.
 */
export function loadWeatherOnIcaoChange<T>(
  route: ActivatedRoute,
  weather: WeatherService,
  fetch: (icao: string) => Observable<T>,
  missing: (icao: string) => string,
): WeatherLoad<T> {
  const data = signal<T | null>(null);
  const error = signal<string | null>(null);
  const pending = signal<string | null>(null);

  const params = route.parent ? route.parent.paramMap : route.paramMap;

  params
    .pipe(
      // Uppercased because the server caches per URL path, so a hand-typed
      // /weather/ekod would otherwise be a second cache entry for the same airport.
      map((values) => (values.get('icao') ?? '').toUpperCase()),
      distinctUntilChanged(),
      tap((icao) => {
        error.set(null);
        data.set(null);
        pending.set(icao);
      }),
      switchMap((icao) =>
        fetch(icao).pipe(
          map((result) => ({ result, failure: null as string | null })),
          catchError((response: HttpErrorResponse) =>
            of({
              result: null,
              failure: weather.describeError(response, icao, missing(icao)),
            }),
          ),
        ),
      ),
      takeUntilDestroyed(),
    )
    .subscribe(({ result, failure }) => {
      pending.set(null);
      data.set(result);
      error.set(failure);
    });

  return { data, error, pending };
}
