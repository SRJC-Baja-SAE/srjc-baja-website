import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const apiToken = process.env.CANVAS_API_TOKEN;
const canvasBaseUrl = 'https://canvas.santarosa.edu';
const outputPath = resolve('src/generated/calendar-events.json');

const calendarContexts = {
  course_85001: { scope: 'team', subteam: null },
  group_56196: { scope: 'subteam', subteam: 'Vehicle Dynamics' },
  group_56285: { scope: 'subteam', subteam: 'Powertrain' },
  group_56286: { scope: 'subteam', subteam: 'Chassis' },
  group_56287: { scope: 'subteam', subteam: 'Electrical' },
  group_56288: { scope: 'subteam', subteam: 'Manufacturing' },
  group_56289: { scope: 'subteam', subteam: 'Business' },
  group_56290: { scope: 'subteam', subteam: 'Simulations' },
};

if (!apiToken) {
  throw new Error('CANVAS_API_TOKEN is required to sync Canvas calendars.');
}

function getNextPage(linkHeader) {
  if (!linkHeader) return null;

  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) return match[1];
  }

  return null;
}

async function fetchCalendarEvents() {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  end.setUTCFullYear(end.getUTCFullYear() + 1);

  const url = new URL('/api/v1/calendar_events', canvasBaseUrl);
  url.searchParams.set('type', 'event');
  url.searchParams.set('start_date', start.toISOString());
  url.searchParams.set('end_date', end.toISOString());
  url.searchParams.set('per_page', '100');

  for (const contextCode of Object.keys(calendarContexts)) {
    url.searchParams.append('context_codes[]', contextCode);
  }

  const events = [];
  let nextUrl = url.toString();

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
        'User-Agent': 'SRJC-Baja-Website-Calendar-Sync/2.0 (https://srjcsaeclub.org)',
      },
    });

    if (!response.ok) {
      throw new Error(`Canvas calendar request failed with HTTP ${response.status}.`);
    }

    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error('Canvas calendar response was not an event list.');
    }

    events.push(...page);
    nextUrl = getNextPage(response.headers.get('link'));
  }

  return events;
}

const rawEvents = await fetchCalendarEvents();

const events = rawEvents
  .filter((event) => event && event.workflow_state !== 'deleted' && !event.hidden)
  .map((event) => {
    const context = calendarContexts[event.context_code];
    if (!context || !event.start_at) return null;

    return {
      id: `canvas-event-${event.id}`,
      title: typeof event.title === 'string' && event.title.trim() ? event.title.trim() : 'Untitled event',
      start: event.all_day && event.all_day_date ? event.all_day_date : event.start_at,
      end: event.all_day ? null : (event.end_at ?? null),
      allDay: Boolean(event.all_day),
      location: typeof event.location_name === 'string' && event.location_name.trim()
        ? event.location_name.trim()
        : null,
      contextCode: event.context_code,
      scope: context.scope,
      subteam: context.subteam,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.start.localeCompare(b.start));

if (events.length === 0) {
  throw new Error('Canvas returned no usable public events; keeping the last generated calendar instead.');
}

const output = `${JSON.stringify({ events }, null, 2)}\n`;
const tempPath = `${outputPath}.tmp`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(tempPath, output, 'utf8');
await rename(tempPath, outputPath);

console.log(`Synced ${events.length} Canvas events across ${Object.keys(calendarContexts).length} calendars.`);
