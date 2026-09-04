import { Component, Input } from '@angular/core';
import { CloudLayerDto } from '../weather/weather.models';

@Component({
  selector: 'app-cloud-layers',
  standalone: false,
  styleUrl: './cloud-layers.css',
  templateUrl: './cloud-layers.html',
})
export class CloudLayers {
  @Input({ required: true }) layers: CloudLayerDto[] = [];

  /**
   * Inline, wrapping layout for use inside a forecast period, versus the stacked rows
   * used under current conditions. An explicit variant rather than letting a parent
   * override our styles: view encapsulation would stop such an override applying.
   */
  @Input() compact = false;
}
