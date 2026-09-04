import { ForecastPeriodDto, TafDto } from './weather.models';

/**
 * Resolves a Zulu "HH:mm" against a TAF's validity window.
 *
 * A time alone is ambiguous: a 24-hour TAF issued at 18:00 covers two different 06:00s.
 * So we walk the days the forecast spans and return the first occurrence that falls
 * inside the window. Null means the time is outside the forecast altogether.
 */
export function resolveInstant(hhmm: string, taf: TafDto): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);

  if (!match) {
    return null;
  }

  const window = validityWindow(taf);

  if (!window) {
    return null;
  }

  const [from, to] = window;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  // Start the day before the window opens, so a window that begins late in the day
  // still catches an early-morning time on its first calendar day.
  const firstDay = new Date(from);
  firstDay.setUTCDate(firstDay.getUTCDate() - 1);
  firstDay.setUTCHours(0, 0, 0, 0);

  for (let day = 0; day <= 3; day++) {
    const candidate = new Date(firstDay);
    candidate.setUTCDate(candidate.getUTCDate() + day);
    candidate.setUTCHours(hours, minutes, 0, 0);

    const at = candidate.getTime();

    if (at >= from && at <= to) {
      return at;
    }
  }

  return null;
}

/**
 * Every group covering the given instant.
 *
 * Usually more than one: TEMPO and PROB groups are nested inside the prevailing
 * period's span rather than following it, so at 15:30 you can have the prevailing
 * forecast plus a TEMPO plus a PROB group, all applying at once. Returning only the
 * prevailing one would hide exactly the conditions a TAF is read for.
 */
export function periodsAt(periods: ForecastPeriodDto[], instant: number): ForecastPeriodDto[] {
  return periods.filter((period) => {
    // A missing bound means open-ended on that side rather than "excluded".
    const start = period.periodStart ? Date.parse(period.periodStart) : Number.NEGATIVE_INFINITY;
    const end = period.periodEnd ? Date.parse(period.periodEnd) : Number.POSITIVE_INFINITY;

    return instant >= start && instant < end;
  });
}

/** The TAF's stated validity, falling back to the span of its own periods. */
function validityWindow(taf: TafDto): [number, number] | null {
  const stated = [taf.validFrom, taf.validTo].map((value) => (value ? Date.parse(value) : NaN));

  if (!Number.isNaN(stated[0]) && !Number.isNaN(stated[1])) {
    return [stated[0], stated[1]];
  }

  const starts = taf.periods.map((p) => (p.periodStart ? Date.parse(p.periodStart) : NaN));
  const ends = taf.periods.map((p) => (p.periodEnd ? Date.parse(p.periodEnd) : NaN));
  const known = [...starts, ...ends].filter((value) => !Number.isNaN(value));

  return known.length > 0 ? [Math.min(...known), Math.max(...known)] : null;
}
