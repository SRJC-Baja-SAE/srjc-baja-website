import calendarData from './generated/calendar-events.json';

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string | null;
  allDay: boolean;
  location: string | null;
  contextCode: string;
  scope: 'team' | 'subteam';
  subteam: string | null;
};

export const calendarFilters = [
  { value: 'all', label: 'All calendars' },
  { value: 'team', label: 'Team' },
  { value: 'Chassis', label: 'Chassis' },
  { value: 'Vehicle Dynamics', label: 'Vehicle Dynamics' },
  { value: 'Powertrain', label: 'Powertrain' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Business', label: 'Business' },
  { value: 'Simulations', label: 'Simulations' },
] as const;

export type CalendarFilter = (typeof calendarFilters)[number]['value'];

const timeZone = 'America/Los_Angeles';
const events = calendarData.events as CalendarEvent[];

function eventDate(event: CalendarEvent) {
  if (event.allDay) {
    return new Date(`${event.start}T12:00:00Z`);
  }

  return new Date(event.start);
}

function eventEndDate(event: CalendarEvent) {
  if (!event.end) return eventDate(event);
  if (event.allDay) return new Date(`${event.end}T12:00:00Z`);
  return new Date(event.end);
}

function matchesCalendar(event: CalendarEvent, filter: CalendarFilter) {
  if (filter === 'all') return true;
  if (filter === 'team') return event.scope !== 'subteam';
  return event.subteam === filter;
}

export function getUpcomingEvents(filter: CalendarFilter = 'all', limit = 8, now = new Date()) {
  return events
    .filter((event) => {
      return eventEndDate(event).getTime() >= now.getTime() && matchesCalendar(event, filter);
    })
    .sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime())
    .slice(0, limit);
}

export function getEventAudience(event: CalendarEvent) {
  return event.scope === 'subteam' && event.subteam ? event.subteam : 'Team';
}

export function formatEventDate(event: CalendarEvent) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: event.allDay ? 'UTC' : timeZone,
  }).format(eventDate(event));
}

export function formatEventTime(event: CalendarEvent) {
  if (event.allDay) {
    return 'All day';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  });

  const start = formatter.format(new Date(event.start));
  const end = event.end ? formatter.format(new Date(event.end)) : null;

  return end ? `${start}-${end}` : start;
}
