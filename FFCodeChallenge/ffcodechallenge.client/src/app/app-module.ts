import { HttpClientModule } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AirportSearch } from './airport-search/airport-search';
import { CloudLayers } from './cloud-layers/cloud-layers';
import { CurrentConditions } from './current-conditions/current-conditions';
import { FlightCategory } from './flight-category/flight-category';
import { Forecast } from './forecast/forecast';
import { ForecastPeriod } from './forecast-period/forecast-period';
import { ForecastTimeFilter } from './forecast-time-filter/forecast-time-filter';
import { FullView } from './full-view/full-view';
import { Landing } from './landing/landing';
import { LoadState } from './load-state/load-state';
import { MetarView } from './metar-view/metar-view';
import { RunwayComponents } from './runway-components/runway-components';
import { TafView } from './taf-view/taf-view';
import { ViewTabs } from './view-tabs/view-tabs';
import { WeatherShell } from './weather-shell/weather-shell';

@NgModule({
  declarations: [
    App,
    AirportSearch,
    Landing,
    WeatherShell,
    ViewTabs,
    FullView,
    MetarView,
    TafView,
    CurrentConditions,
    FlightCategory,
    Forecast,
    ForecastPeriod,
    ForecastTimeFilter,
    CloudLayers,
    RunwayComponents,
    LoadState,
  ],
  imports: [BrowserModule, HttpClientModule, FormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
