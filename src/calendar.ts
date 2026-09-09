import calendarData from './generated/calendar-events.json';

export type CalendarEventType = 'milestone' | 'purchase' | 'meeting' | 'external';

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  location: string | null;
  description?: string | null;
  contextCode: string;
  scope: 'team' | 'subteam';
  subteam: string | null;
  type?: CalendarEventType;
  major?: boolean;
};

export const calendarFilters = [
  { value: 'team', label: 'Whole team' },
  { value: 'Chassis', label: 'Chassis' },
  { value: 'Vehicle Dynamics', label: 'VD' },
  { value: 'Powertrain', label: 'Powertrain' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Business', label: 'Business' },
  { value: 'Simulations', label: 'Simulations' },
] as const;

export type CalendarFilter = (typeof calendarFilters)[number]['value'];
export const calendarTypes: { value: CalendarEventType; label: string }[] = [
  { value: 'milestone', label: 'Milestones' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'external', label: 'External' },
];

const timeZone = 'America/Los_Angeles';
export const events = calendarData.events as CalendarEvent[];

export function eventDate(event: CalendarEvent) {
  return event.allDay ? new Date(`${event.start}T12:00:00Z`) : new Date(event.start);
}

export function eventEndDate(event: CalendarEvent) {
  if (!event.end) return eventDate(event);
  return event.allDay ? new Date(`${event.end}T12:00:00Z`) : new Date(event.end);
}

export function getEventType(event: CalendarEvent): CalendarEventType {
  if (event.type) return event.type;
  const title = event.title.toLowerCase();
  if (/competition|registration|sae deadline|external/.test(title)) return 'external';
  if (/purchase|order|release/.test(title)) return 'purchase';
  if (/meeting|work session|office hours/.test(title)) return 'meeting';
  return 'milestone';
}

export function getEventIcon(event: CalendarEvent) {
  if (isMajorEvent(event)) return '◆';
  const icons: Record<CalendarEventType, string> = {
    milestone: '●',
    purchase: '★',
    meeting: '○',
    external: '▲',
  };
  return icons[getEventType(event)];
}

export function getEventTypeLabel(event: CalendarEvent) {
  if (isMajorEvent(event)) return 'Major gate';
  const labels: Record<CalendarEventType, string> = {
    milestone: 'Milestone',
    purchase: 'Purchase',
    meeting: 'Meeting',
    external: 'External deadline',
  };
  return labels[getEventType(event)];
}

export function isMajorEvent(event: CalendarEvent) {
  return Boolean(event.major) || (event.scope === 'team' && getEventType(event) === 'milestone');
}

export function matchesFilters(
  event: CalendarEvent,
  teams: Set<CalendarFilter>,
  types: Set<CalendarEventType>,
) {
  const audience = event.scope === 'subteam' ? event.subteam : 'team';
  return (teams.size === 0 || teams.has(audience as CalendarFilter))
    && (types.size === 0 || types.has(getEventType(event)));
}

export function getUpcomingEvents(limit = 4, now = new Date()) {
  const future = events
    .filter((event) => eventEndDate(event).getTime() >= now.getTime())
    .sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime());
  const meaningful = future.filter((event) => getEventType(event) !== 'meeting');
  return (meaningful.length >= limit ? meaningful : future).slice(0, limit);
}

export function getEventAudience(event: CalendarEvent) {
  return event.scope === 'subteam' && event.subteam ? event.subteam : 'Team';
}

export function formatEventDate(event: CalendarEvent, long = false) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: long ? 'long' : 'short',
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: long ? 'numeric' : undefined,
    timeZone: event.allDay ? 'UTC' : timeZone,
  }).format(eventDate(event));
}

export function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return 'All day';
  const formatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone });
  const start = formatter.format(new Date(event.start));
  const end = event.end ? formatter.format(new Date(event.end)) : null;
  return end ? `${start}–${end}` : start;
}

export function dateKey(event: CalendarEvent) {
  if (event.allDay) return event.start.slice(0, 10);

  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(eventDate(event));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
