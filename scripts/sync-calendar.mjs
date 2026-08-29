import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const feedUrl = process.env.CANVAS_COURSE_ICS_URL;
const outputPath = resolve('src/generated/calendar-events.json');

if (!feedUrl) {
  throw new Error('CANVAS_COURSE_ICS_URL is required to sync the Canvas calendar.');
}

const response = await fetch(feedUrl, {
  headers: {
    Accept: 'text/calendar',
    'User-Agent': 'SRJC-Baja-Website-Calendar-Sync/1.0 (https://srjcsaeclub.org)',
  },
});

if (!response.ok) {
  throw new Error(`Canvas calendar request failed with HTTP ${response.status}.`);
}

const ics = await response.text();

if (!ics.includes('BEGIN:VCALENDAR')) {
  throw new Error('Canvas calendar response was not an iCalendar feed.');
}

const lines = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
const rawEvents = [];
let current = null;

for (const line of lines) {
  if (line === 'BEGIN:VEVENT') {
    current = new Map();
    continue;
  }

  if (line === 'END:VEVENT') {
    if (current) rawEvents.push(current);
    current = null;
    continue;
  }

  if (!current) continue;

  const colon = line.indexOf(':');
  if (colon < 0) continue;

  const property = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const [name] = property.split(';');
  current.set(name, value);
}

function unescapeText(value = '') {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function normalizeLocation(title, location) {
  if (!location) return null;

  const normalizedTitle = title.replace(/\s+\[SRJC Baja SAE Club\]$/, '');
  if (normalizedTitle === 'General Meeting' && /^Lindley Center, Room (?:111|131)$/.test(location)) {
    return 'Lindley Center, Room 111/131';
  }

  return location;
}

function parseDate(value) {
  if (/^\d{8}$/.test(value)) {
    return {
      value: `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
      allDay: true,
    };
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) {
    throw new Error(`Unsupported Canvas calendar date format: ${value}`);
  }

  const [, year, month, day, hour, minute, second] = match;
  return {
    value: new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)).toISOString(),
    allDay: false,
  };
}

const events = rawEvents
  .filter((event) => event.get('STATUS') !== 'CANCELLED')
  .filter((event) => !['PRIVATE', 'CONFIDENTIAL'].includes(event.get('CLASS')))
  .map((event) => {
    const startValue = event.get('DTSTART');
    if (!startValue) throw new Error('Canvas event is missing DTSTART.');

    const start = parseDate(startValue);
    const endValue = event.get('DTEND');
    const end = endValue ? parseDate(endValue).value : null;
    const rawTitle = unescapeText(event.get('SUMMARY') || 'Untitled event');

    return {
      id: event.get('UID') || `${start.value}-${rawTitle}`,
      title: rawTitle.replace(/\s+\[SRJC Baja SAE Club\]$/, ''),
      start: start.value,
      end,
      allDay: start.allDay,
      location: normalizeLocation(rawTitle, event.get('LOCATION') ? unescapeText(event.get('LOCATION')) : null),
    };
  })
  .sort((a, b) => a.start.localeCompare(b.start));

if (events.length === 0) {
  throw new Error('Canvas calendar contained no usable events; keeping the last generated calendar instead.');
}

const output = `${JSON.stringify({ events }, null, 2)}\n`;
const tempPath = `${outputPath}.tmp`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(tempPath, output, 'utf8');
await rename(tempPath, outputPath);

console.log(`Synced ${events.length} Canvas calendar events.`);
