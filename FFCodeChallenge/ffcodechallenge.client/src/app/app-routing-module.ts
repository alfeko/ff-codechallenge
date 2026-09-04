import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullView } from './full-view/full-view';
import { Landing } from './landing/landing';
import { MetarView } from './metar-view/metar-view';
import { TafView } from './taf-view/taf-view';
import { WeatherShell } from './weather-shell/weather-shell';

const routes: Routes = [
  { path: '', component: Landing },
  {
    // The :icao parameter lives on the parent so the tabs and all three views share it.
    path: 'weather/:icao',
    component: WeatherShell,
    children: [
      { path: '', component: FullView },
      { path: 'metar', component: MetarView },
      { path: 'taf', component: TafView },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
