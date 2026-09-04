import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-view-tabs',
  standalone: false,
  styleUrl: './view-tabs.css',
  templateUrl: './view-tabs.html',
})
export class ViewTabs {
  @Input({ required: true }) icao = '';
}
