import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * The search box. Navigates rather than fetching -- the URL is the source of truth for
 * which airport is shown, so a report can be linked to and survives a refresh.
 */
@Component({
  selector: 'app-airport-search',
  standalone: false,
  styleUrl: './airport-search.css',
  templateUrl: './airport-search.html',
})
export class AirportSearch {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public icaoCode = '';
  public error = signal<string | null>(null);

  search() {
    this.error.set(null);

    if (!/^[A-Za-z]{4}$/.test(this.icaoCode)) {
      this.error.set('Enter a 4-letter ICAO code, like EKOD.');
      return;
    }

    // Uppercased before it reaches the URL: the input's uppercase look is CSS only, and
    // the server caches per URL path, so "ekod" would be a second entry for one airport.
    const code = this.icaoCode.toUpperCase();

    // Keep whichever view is open, so searching a new airport from the TAF tab stays
    // on TAF rather than throwing the user back to the full report.
    this.router.navigate(['/weather', code, ...this.currentViewSegment()]);
  }

  /** [] for the full view, ['metar'] or ['taf'] when one of those tabs is open. */
  private currentViewSegment(): string[] {
    const child = this.route.snapshot.firstChild?.firstChild;
    const segment = child?.url[0]?.path;

    return segment ? [segment] : [];
  }
}
