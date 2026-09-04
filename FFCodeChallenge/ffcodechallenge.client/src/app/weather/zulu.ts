/**
 * Aviation times are Zulu. Formatted from the ISO string rather than with the `date`
 * pipe, whose timezone is the THIRD argument -- omit it and the pipe silently renders
 * browser-local time, so an 0900Z period reads as 11:00 in Copenhagen with no visual
 * cue that it is wrong. This is deterministic and testable instead.
 */
export function zuluTime(value: string | null): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(11, 16);
}
