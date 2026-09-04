import { Component, Input } from '@angular/core';

/** Spinner and error message, shared by all three view containers. */
@Component({
  selector: 'app-load-state',
  standalone: false,
  styleUrl: './load-state.css',
  templateUrl: './load-state.html',
})
export class LoadState {
  /** The ICAO currently being fetched, or null when idle. */
  @Input() pending: string | null = null;

  @Input() error: string | null = null;
}
