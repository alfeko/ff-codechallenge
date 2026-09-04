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
  /** Significant cloud type ('cb', 'tcu'); null when not reported. */
  type: string | null;
  altitudeFt: number;
  ceiling: boolean;
}

export interface RunwayDto {
  designator: string;
  headingDegrees: number;
  /** Positive = headwind, negative = tailwind. */
  headwindKts: number;
  /** Positive = wind from the pilot's right, negative = from the left. */
  crosswindKts: number;
}

export interface ForecastPeriodDto {
  /** Raw TAF fragment for this group. */
  text: string | null;
  /** Change group; null on the prevailing period. */
  change: string | null;
  /** 'vfr' | 'mvfr' | 'ifr' | 'lifr', or null. */
  flightRules: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  visibility: VisibilityDto | null;
  wind: WindDto | null;
  runways: RunwayDto[];
  cloudLayers: CloudLayerDto[];
  weather: string[];
}

/** Current observed conditions. Served both standalone and inside AirportWeatherDto. */
export interface MetarDto {
  icao: string;
  temperatureC: number;
  pressureHg: number;
  pressureHpa: number;
  visibility: VisibilityDto;
  wind: WindDto;
  runways: RunwayDto[];
  cloudLayers: CloudLayerDto[];
}

/** The forecast. Served both standalone and inside AirportWeatherDto. */
export interface TafDto {
  icao: string;
  /** Raw TAF string. */
  text: string | null;
  dateIssued: string | null;
  validFrom: string | null;
  validTo: string | null;
  periods: ForecastPeriodDto[];
}

export interface AirportWeatherDto {
  icao: string;
  metar: MetarDto;
  /** Null when the airport publishes no TAF. */
  taf: TafDto | null;
}
