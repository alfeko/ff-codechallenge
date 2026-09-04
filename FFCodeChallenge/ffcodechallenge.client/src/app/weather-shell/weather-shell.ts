import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/**
 * Owns the :icao route parameter for all three views. Renders the view tabs and the
 * child outlet; the children read the same parameter from this route.
 */
@Component({
  selector: 'app-weather-shell',
  standalone: false,
  templateUrl: './weather-shell.html',
})
export class WeatherShell {
  private readonly route = inject(ActivatedRoute);

  /** Read reactively: navigating between airports reuses this component. */
  protected readonly icao = toSignal(
    this.route.paramMap.pipe(map((params) => (params.get('icao') ?? '').toUpperCase())),
    { initialValue: '' },
  );
}
