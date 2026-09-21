import { useEffect, useMemo, useRef, useState } from 'react';
import {
  canvasEnrollmentUrl,
  galleryPhotos,
  partners,
  socialLinks,
  subteams,
  updates,
} from './content';
import {
  calendarFilters,
  calendarTypes,
  dateKey,
  eventDate,
  events,
  formatEventDate,
  formatEventTime,
  getEventAudience,
  getEventType,
  getEventTypeLabel,
  getUpcomingEvents,
  isMajorEvent,
  matchesFilters,
  monthKey,
  type CalendarEvent,
  type CalendarEventType,
  type CalendarFilter,
} from './calendar';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Updates', href: '#updates' },
  { label: 'Team', href: '#team' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Calendar', href: './calendar/' },
] as const;

const sponsorTiers = ['Platinum', 'Gold', 'Bronze', 'Copper'] as const;

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M15 18 9 12l6-6' : 'm9 18 6-6-6-6';

  return (
    <svg className="chevron-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

type EventSymbolKind = CalendarEventType | 'major';

function EventSymbol({ kind }: { kind: EventSymbolKind }) {
  return (
    <svg className={`event-symbol event-symbol-${kind}`} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      {kind === 'major' ? <path d="M6 1 11 6 6 11 1 6Z" fill="currentColor" /> : null}
      {kind === 'milestone' ? <circle cx="6" cy="6" r="3.2" fill="currentColor" /> : null}
      {kind === 'meeting' ? <circle cx="6" cy="6" r="3.45" fill="none" stroke="currentColor" strokeWidth="1.35" /> : null}
      {kind === 'purchase' ? <path d="M6 0.9 7.5 4.15 11.05 4.5 8.4 6.85 9.2 10.35 6 8.55 2.8 10.35 3.6 6.85 0.95 4.5 4.5 4.15Z" fill="currentColor" /> : null}
      {kind === 'external' ? <path d="M6 1.1 11 10.2H1Z" fill="currentColor" /> : null}
    </svg>
  );
}

function eventSymbolKind(event: CalendarEvent): EventSymbolKind {
  return isMajorEvent(event) ? 'major' : getEventType(event);
}

const maxMonthEventsPerDay = 4;

function monthEventPriority(event: CalendarEvent) {
  if (isMajorEvent(event)) return 0;
  const typePriority: Record<CalendarEventType, number> = {
    milestone: 1,
    purchase: 1,
    external: 2,
    meeting: 3,
  };
  return typePriority[getEventType(event)];
}

function prioritizeMonthEvents(dayEvents: CalendarEvent[]) {
  return dayEvents
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const priority = monthEventPriority(a.event) - monthEventPriority(b.event);
      if (priority !== 0) return priority;

      const scopePriority = Number(a.event.scope === 'subteam') - Number(b.event.scope === 'subteam');
      if (scopePriority !== 0) return scopePriority;

      return a.index - b.index;
    })
    .map(({ event }) => event);
}

function EventDetail({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  useEffect(() => {
    const closeOnEscape = (key: KeyboardEvent) => {
      if (key.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="event-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="event-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        onMouseDown={(click) => click.stopPropagation()}
      >
        <button className="event-detail-close" type="button" onClick={onClose} aria-label="Close event details">×</button>
        <span className={`event-kind event-kind-${getEventType(event)}`}><EventSymbol kind={eventSymbolKind(event)} /><span>{getEventTypeLabel(event)}</span></span>
        <h2 id="event-detail-title">{event.title}</h2>
        <dl>
          <div><dt>Date</dt><dd>{formatEventDate(event, true)}</dd></div>
          <div><dt>Time</dt><dd>{formatEventTime(event)}</dd></div>
          <div><dt>Team</dt><dd>{getEventAudience(event)}</dd></div>
          {event.location ? <div><dt>Location</dt><dd>{event.location}</dd></div> : null}
        </dl>
        {event.description ? <p className="event-description">{event.description}</p> : null}
      </section>
    </div>
  );
}

function DayDetail({
  events: dayEvents,
  onClose,
  onEvent,
}: {
  events: CalendarEvent[];
  onClose: () => void;
  onEvent: (event: CalendarEvent) => void;
}) {
  useEffect(() => {
    const closeOnEscape = (key: KeyboardEvent) => {
      if (key.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const firstEvent = dayEvents[0];

  return (
    <div className="event-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="event-detail day-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
        onMouseDown={(click) => click.stopPropagation()}
      >
        <button className="event-detail-close" type="button" onClick={onClose} aria-label="Close day details">×</button>
        <p className="eyebrow">Day schedule</p>
        <h2 id="day-detail-title">{firstEvent ? formatEventDate(firstEvent, true) : 'Events'}</h2>
        <div className="day-detail-events">
          {dayEvents.map((event) => (
            <button
              type="button"
              className={`agenda-event agenda-event-${getEventType(event)} team-${(event.subteam ?? 'team').toLowerCase().replace(/\s+/g, '-')}`}
              key={event.id}
              onClick={() => onEvent(event)}
            >
              <span className={`event-kind event-kind-${getEventType(event)}`}><EventSymbol kind={eventSymbolKind(event)} /><span>{getEventTypeLabel(event)}</span></span>
              <strong>{event.title}</strong>
              <small>{getEventAudience(event)} · {formatEventTime(event)}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterBar({
  teams,
  types,
  onTeam,
  onTypes,
}: {
  teams: Set<CalendarFilter>;
  types: Set<CalendarEventType>;
  onTeam: (value: CalendarFilter | 'all') => void;
  onTypes: (values: Set<CalendarEventType>) => void;
}) {
  return (
    <div className="calendar-filters" aria-label="Calendar filters">
      <div className="team-filter-chips">
        <button type="button" className={teams.size === 0 ? 'filter-chip is-active' : 'filter-chip'} onClick={() => onTeam('all')}>All</button>
        {calendarFilters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            className={`filter-chip team-${filter.value.toLowerCase().replace(/\s+/g, '-')} ${teams.has(filter.value) ? 'is-active' : ''}`}
            aria-pressed={teams.has(filter.value)}
            onClick={() => onTeam(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <label className="type-filter">
        <span>Type</span>
        <select
          value={types.size === 1 ? [...types][0] : types.size === 0 ? 'all' : 'mixed'}
          onChange={(change) => {
            const value = change.target.value;
            onTypes(value === 'all' ? new Set() : new Set([value as CalendarEventType]));
          }}
        >
          <option value="all">All types</option>
          {types.size > 1 ? <option value="mixed">Multiple types</option> : null}
          {calendarTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </label>
    </div>
  );
}

function CalendarPage() {
  const firstEvent = events[0] ? eventDate(events[0]) : new Date();
  const [month, setMonth] = useState(new Date(firstEvent.getFullYear(), firstEvent.getMonth(), 1));
  const [view, setView] = useState<'month' | 'agenda'>(() => window.matchMedia('(max-width: 760px)').matches ? 'agenda' : 'month');
  const [teams, setTeams] = useState<Set<CalendarFilter>>(new Set());
  const [types, setTypes] = useState<Set<CalendarEventType>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);
  const filtered = useMemo(() => events.filter((event) => matchesFilters(event, teams, types)), [teams, types]);
  const monthEvents = filtered.filter((event) => dateKey(event).startsWith(monthKey(month)));
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells = Array.from({ length: Math.ceil((leading + daysInMonth) / 7) * 7 }, (_, index) => index - leading + 1);
  const grouped = monthEvents.reduce<Record<string, CalendarEvent[]>>((result, event) => {
    (result[dateKey(event)] ??= []).push(event);
    return result;
  }, {});
  const toggleTeam = (value: CalendarFilter | 'all') => {
    if (value === 'all') return setTeams(new Set());
    setTeams((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };
  const moveMonth = (amount: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const switchForScreen = (change: MediaQueryListEvent) => setView(change.matches ? 'agenda' : 'month');
    media.addEventListener('change', switchForScreen);
    return () => media.removeEventListener('change', switchForScreen);
  }, []);

  return (
    <div className="site-shell calendar-page">
      <header className="site-header">
        <a className="brand" href="../" aria-label="SRJC Baja SAE home">
          <img src="../assets/srjc-baja-logo.png" alt="" width="42" height="42" />
          <span><strong>SRJC BAJA</strong><small>SAE CLUB</small></span>
        </a>
        <nav className="site-nav calendar-page-nav" aria-label="Calendar navigation">
          <a href="../">Home</a>
          <ExternalLink className="nav-cta" href={canvasEnrollmentUrl}>Join</ExternalLink>
        </nav>
      </header>
      <main className="full-calendar-main">
        <div className="page-width">
          <div className="full-calendar-intro">
            <div><p className="eyebrow">Team schedule</p><h1>Calendar</h1></div>
            <p>See whole-team gates, subteam deliverables, purchases, meetings, and external deadlines.</p>
          </div>
          <div className="calendar-toolbar">
            <div className="view-toggle" aria-label="Calendar view">
              <button type="button" className={view === 'month' ? 'is-active' : ''} onClick={() => setView('month')}>Month</button>
              <button type="button" className={view === 'agenda' ? 'is-active' : ''} onClick={() => setView('agenda')}>Agenda</button>
            </div>
            <div className="month-navigation">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronIcon direction="left" /></button>
              <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronIcon direction="right" /></button>
            </div>
          </div>
          <FilterBar teams={teams} types={types} onTeam={toggleTeam} onTypes={setTypes} />
          <div className="calendar-legend" aria-label="Calendar legend">
            <span><EventSymbol kind="major" /> Major gate</span>
            <span><EventSymbol kind="milestone" /> Milestone</span>
            <span><EventSymbol kind="purchase" /> Purchase</span>
            <span><EventSymbol kind="meeting" /> Meeting</span>
            <span><EventSymbol kind="external" /> External deadline</span>
            <small>Edge color identifies the responsible team.</small>
            {teams.size > 0 || types.size > 0 ? (
              <button type="button" onClick={() => { setTeams(new Set()); setTypes(new Set()); }}>Clear filters</button>
            ) : null}
          </div>
          {monthEvents.length === 0 ? (
            <div className="calendar-no-results">
              <strong>No matching events this month</strong>
              <span>Try another team, event type, or month.</span>
            </div>
          ) : null}
          {view === 'month' ? (
            <div className="month-grid-wrap">
              <div className="month-grid weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day}>{day}</div>)}</div>
              <div className="month-grid">
                {cells.map((day, index) => {
                  const key = day > 0 && day <= daysInMonth ? `${monthKey(month)}-${String(day).padStart(2, '0')}` : '';
                  return (
                    <div className={key ? 'calendar-day' : 'calendar-day is-outside'} key={index}>
                      {key ? <time dateTime={key}>{day}</time> : null}
                      <div className="day-events">
                        {(() => {
                          const dayEvents = prioritizeMonthEvents(grouped[key] ?? []);
                          const visibleEvents = dayEvents.slice(0, maxMonthEventsPerDay);
                          const hiddenCount = dayEvents.length - visibleEvents.length;

                          return (
                            <>
                              {visibleEvents.map((event) => (
                                <button
                                  type="button"
                                  key={event.id}
                                  title={`${getEventTypeLabel(event)}: ${event.title}. ${getEventAudience(event)}.`}
                                  className={`event-chip event-chip-${getEventType(event)} team-${(event.subteam ?? 'team').toLowerCase().replace(/\s+/g, '-')} ${isMajorEvent(event) ? 'is-major' : ''}`}
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <EventSymbol kind={eventSymbolKind(event)} />
                                  <b>{event.title}</b>
                                  <small>{getEventAudience(event)}</small>
                                </button>
                              ))}
                              {hiddenCount > 0 ? (
                                <button
                                  type="button"
                                  className="day-more-events"
                                  onClick={() => setSelectedDayEvents(dayEvents)}
                                  aria-label={`Show ${dayEvents.length} events for ${key}`}
                                >
                                  +{hiddenCount} more
                                </button>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="calendar-agenda">
              {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([key, dayEvents]) => (
                <section className="agenda-day" key={key}>
                  <time dateTime={key}>{new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</time>
                  <div>{dayEvents.map((event) => (
                    <button type="button" className={`agenda-event agenda-event-${getEventType(event)} team-${(event.subteam ?? 'team').toLowerCase().replace(/\s+/g, '-')}`} key={event.id} onClick={() => setSelectedEvent(event)}>
                      <span className={`event-kind event-kind-${getEventType(event)}`}><EventSymbol kind={eventSymbolKind(event)} /><span>{getEventTypeLabel(event)}</span></span>
                      <strong>{event.title}</strong>
                      <small>{getEventAudience(event)} · {formatEventTime(event)}</small>
                    </button>
                  ))}</div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedDayEvents ? (
        <DayDetail
          events={selectedDayEvents}
          onClose={() => setSelectedDayEvents(null)}
          onEvent={(event) => {
            setSelectedDayEvents(null);
            setSelectedEvent(event);
          }}
        />
      ) : null}
      {selectedEvent ? <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const upcomingEvents = getUpcomingEvents(4);

  const closeMenu = () => setMenuOpen(false);
  const showPreviousPhoto = () => {
    setActivePhoto((current) => (current - 1 + galleryPhotos.length) % galleryPhotos.length);
  };
  const showNextPhoto = () => {
    setActivePhoto((current) => (current + 1) % galleryPhotos.length);
  };

  if (window.location.pathname.replace(/\/+$/, '').endsWith('/calendar')) {
    return <CalendarPage />;
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SRJC Baja SAE home" onClick={closeMenu}>
          <img src="./assets/srjc-baja-logo.png" alt="" width="42" height="42" />
          <span>
            <strong>SRJC BAJA</strong>
            <small>SAE CLUB</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-navigation" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a className="nav-cta" href="#calendar" onClick={closeMenu}>
            Join
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="top" aria-labelledby="hero-title">
          <img
            className="hero-image"
            src="./assets/baja-car-hero.webp"
            alt="Baja SAE vehicle climbing a tire obstacle at competition"
          />
          <div className="hero-scrim" />
          <div className="hero-content page-width">
            <p className="eyebrow">Santa Rosa Junior College</p>
            <h1 id="hero-title">
              <span>BAJA SAE</span>
            </h1>
            <p className="hero-copy">
              We design, build, and test a single-seat off-road car for Baja SAE.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#calendar">
                Join the Team
              </a>
              <a className="button button-outline" href="#sponsors">
                Become a Sponsor
              </a>
              <a className="text-link" href="#gallery">
                See what we're building
              </a>
            </div>
          </div>
          <div className="hero-photo-label">Baja SAE Arizona photo by Blue Jay Racing</div>
        </section>

        <section className="section section-about" id="about">
          <div className="page-width about-layout">
            <div className="section-heading">
              <p className="eyebrow">What is Baja SAE?</p>
              <h2>Engineering that has to work <span className="nowrap">off-road</span></h2>
            </div>
            <div className="about-copy">
              <p className="lead">
                Baja SAE is a collegiate competition for student-built, single-seat off-road cars. Judges review each car before teams put it through driving events and an endurance race.
              </p>
              <p>
                At SRJC, we learn CAD, analysis, machining, welding, electronics, testing, and project planning while we build a real car.
              </p>
              <ExternalLink className="text-link" href="https://www.bajasae.net/">
                Learn about Baja SAE
              </ExternalLink>
            </div>
          </div>

          <div className="page-width engineering-strip">
            <figure className="engineering-photo engineering-photo-main">
              <img
                src="./assets/baja-context.webp"
                alt="Baja SAE vehicle driving on a dirt course"
                loading="lazy"
              />
              <figcaption>Photo: USF Mini Baja testing</figcaption>
            </figure>
            <div className="engineering-notes">
              <div>
                <h3>Static events</h3>
                <p>Judges review the car's design, cost, and business case.</p>
              </div>
              <div>
                <h3>Dynamic events</h3>
                <p>Driving events and an endurance race test the car on course.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-gallery" id="gallery">
          <div className="page-width">
            <div className="section-heading section-heading-row">
              <div>
                <p className="eyebrow">Building the car</p>
                <h2>Students doing the work</h2>
              </div>
              <p className="section-aside">
                SRJC students design, machine, fabricate, and assemble parts as they build the car.
              </p>
            </div>

            <div className="gallery-shell">
              <figure
                className="gallery-stage"
                onTouchStart={(event) => {
                  touchStartXRef.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (touchStartXRef.current === null) return;
                  const delta = (event.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
                  if (delta > 50) {
                    showPreviousPhoto();
                  } else if (delta < -50) {
                    showNextPhoto();
                  }
                  touchStartXRef.current = null;
                }}
              >
                <img
                  src={galleryPhotos[activePhoto].src}
                  alt={galleryPhotos[activePhoto].alt}
                  loading="lazy"
                />
                <button className="gallery-arrow gallery-arrow-previous" type="button" onClick={showPreviousPhoto} aria-label="Show previous photo">
                  <ChevronIcon direction="left" />
                </button>
                <button className="gallery-arrow gallery-arrow-next" type="button" onClick={showNextPhoto} aria-label="Show next photo">
                  <ChevronIcon direction="right" />
                </button>
                <figcaption>
                  <span>{galleryPhotos[activePhoto].caption}</span>
                  <small>{activePhoto + 1} / {galleryPhotos.length}</small>
                </figcaption>
              </figure>

              <div className="gallery-thumbnails" role="group" aria-label="Choose a gallery photo">
                {galleryPhotos.map((photo, index) => (
                  <button
                    className={index === activePhoto ? 'gallery-thumbnail is-active' : 'gallery-thumbnail'}
                    type="button"
                    key={photo.src}
                    aria-current={index === activePhoto ? 'true' : undefined}
                    onClick={() => setActivePhoto(index)}
                  >
                    <img src={photo.src} alt="" loading="lazy" />
                    <span>{photo.caption}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-updates" id="updates">
          <div className="page-width">
            <div className="section-heading section-heading-row">
              <div>
                <h2>Team highlights</h2>
              </div>
              <div className="highlight-socials">
                {socialLinks
                  .filter((link) => link.label === 'Instagram' || link.label === 'LinkedIn')
                  .map((link) => (
                    <ExternalLink key={link.label} className="text-link" href={link.href}>
                      More on {link.label}
                    </ExternalLink>
                  ))}
              </div>
            </div>

            <div className="updates-list">
              {updates.map((update) => (
                <ExternalLink key={update.href} className="update-row" href={update.href}>
                  <div className="update-meta">
                    <time>{update.date}</time>
                    <span>{update.source}</span>
                  </div>
                  <div className="update-body">
                    <h3>{update.title}</h3>
                  </div>
                  <span className="update-arrow" aria-hidden="true">
                    <ChevronIcon direction="right" />
                  </span>
                </ExternalLink>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-team" id="team">
          <div className="page-width team-layout">
            <div className="team-intro">
              <h2>How we build the car</h2>
              <p>
                We work in engineering and business groups. Together, we design, fabricate, test, document, and support the car.
              </p>
              <ExternalLink className="button button-outline" href={canvasEnrollmentUrl}>
                Join on Canvas
              </ExternalLink>
            </div>

            <div className="subteam-list">
              {subteams.map((subteam, index) => (
                <article className="subteam-row" key={subteam.name}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{subteam.name}</h3>
                    <p>{subteam.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-partners" id="sponsors">
          <div className="page-width">
            <div className="section-heading section-heading-row">
              <div>
                <p className="eyebrow">Support behind the build</p>
                <h2>Our sponsors</h2>
              </div>
              <p className="section-aside">
                Sponsor support provides materials, tooling, software, components, testing, and competition travel.
              </p>
            </div>
          </div>

          <div className="partner-wall">
            <div className="page-width sponsor-tiers">
              {sponsorTiers.map((tier) => (
                <div className={`sponsor-tier sponsor-tier-${tier.toLowerCase()}`} key={tier}>
                  <div className="sponsor-tier-label">{tier}</div>
                  <div className="sponsor-tier-partners">
                    {partners.filter((partner) => partner.tier === tier).map((partner) => (
                      <ExternalLink key={partner.name} className="partner" href={partner.href}>
                        <img src={partner.logo} alt={`${partner.name} logo`} loading="lazy" />
                        <span>{partner.name}</span>
                      </ExternalLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-width sponsor-callout">
            <div>
              <p className="eyebrow">Partner with SRJC Baja</p>
              <h3>Help turn student engineering into a competition-ready vehicle</h3>
            </div>
            <div className="sponsor-actions">
              <a className="button button-primary" href="./sponsor-package.pdf" target="_blank" rel="noreferrer">
                View sponsorship package
              </a>
              <a className="text-link" href="mailto:srjcsaeclub@gmail.com?subject=SRJC%20Baja%20SAE%20Sponsorship">
                Email the team
              </a>
            </div>
          </div>
        </section>

        <section className="section section-calendar" id="calendar">
          <div className="page-width calendar-layout">
            <div className="calendar-copy">
              <p className="eyebrow">Meetings and events</p>
              <h2>Come work with us</h2>
              <p>
                Open to current SRJC students of any major. No prior Baja, automotive, or shop experience is required. Join Canvas, then come to a Friday meeting to meet the team and find a place to start.
              </p>
              <div className="meeting-block">
                <span>Weekly meeting</span>
                <strong>Fridays at 6:00 PM</strong>
                <p>Lindley Center, Room 111/131</p>
                <ExternalLink className="button button-primary" href={canvasEnrollmentUrl}>
                  Join on Canvas
                </ExternalLink>
                <a className="text-link" href="./calendar/">View full calendar</a>
              </div>
              <div className="competition-target">
                <span>Target competition</span>
                <strong>Baja SAE Arizona</strong>
                <p>April 29-May 2, 2027 - Marana, Arizona</p>
                <small>Dates are tentative and subject to change.</small>
              </div>
              <div className="contact-block">
                <span>Contact</span>
                <a href="mailto:srjcsaeclub@gmail.com">srjcsaeclub@gmail.com</a>
                <p>Santa Rosa Junior College - Santa Rosa, California</p>
              </div>
            </div>

            <section className="calendar-events" id="events" aria-labelledby="events-heading">
              <div className="calendar-events-heading">
                <div>
                  <h3 id="events-heading">Next up</h3>
                  <small>Synced from Canvas</small>
                </div>
                <a className="text-link" href="./calendar/">View full calendar</a>
              </div>
              {upcomingEvents.length > 0 ? (
                <ol className="calendar-event-list">
                  {upcomingEvents.map((event) => (
                    <li className="calendar-event" key={event.id}>
                      <time className="calendar-event-date" dateTime={event.start}>
                        {formatEventDate(event)}
                      </time>
                      <div className="calendar-event-body">
                        <span className="calendar-event-audience">{getEventAudience(event)}</span>
                        <h3>{event.title}</h3>
                        <p>{formatEventTime(event)}</p>
                        {event.location ? <p>{event.location}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="calendar-empty">
                  <h3>No upcoming events are listed.</h3>
                  <p>Check back soon or contact the team for the current schedule.</p>
                </div>
              )}
            </section>
          </div>
        </section>

      </main>

      <footer className="site-footer" id="site-footer">
        <div className="page-width footer-main">
          <div className="footer-brand">
            <img src="./assets/srjc-baja-logo.png" alt="" width="58" height="58" loading="lazy" />
            <div>
              <strong>SRJC BAJA SAE</strong>
              <p>Student-run Baja SAE team at Santa Rosa Junior College.</p>
              <a href="mailto:srjcsaeclub@gmail.com">srjcsaeclub@gmail.com</a>
            </div>
          </div>

          <nav className="footer-group" aria-label="Footer site navigation">
            <span className="footer-heading">Explore</span>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-group">
            <span className="footer-heading">Join & connect</span>
            <ExternalLink href={canvasEnrollmentUrl}>Join on Canvas</ExternalLink>
            {socialLinks.map((link) => (
              <ExternalLink key={link.label} href={link.href}>
                {link.label}
              </ExternalLink>
            ))}
          </div>

          <div className="footer-group">
            <span className="footer-heading">Baja SAE resources</span>
            <ExternalLink href="https://www.bajasae.net/">Official Baja SAE site</ExternalLink>
            <ExternalLink href="https://www.bajasae.net/cdsweb/gen/DocumentResources.aspx">
              Current rules & documents
            </ExternalLink>
            <a href="./sponsor-package.pdf" target="_blank" rel="noreferrer">
              Sponsorship package
            </a>
          </div>
        </div>

        <div className="page-width footer-support-row">
          <p>Support hands-on student engineering at SRJC.</p>
          <ExternalLink
            className="button button-outline footer-support"
            href="https://account.venmo.com/pay?recipients=srjc_clubaccounts&amount=25&note=SRJC%20Baja%20SAE%20Donation"
          >
            Support our build
          </ExternalLink>
        </div>


        <div className="page-width footer-photo-credit">
          <span>Competition photos:</span>
          <ExternalLink href="https://commons.wikimedia.org/wiki/File:Baja_SAE_Arizona_2025_Blue_Jay_Racing.png">
            Bobdobchob / Blue Jay Racing
          </ExternalLink>
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0, cropped</ExternalLink>
          <span>/</span>
          <ExternalLink href="https://commons.wikimedia.org/wiki/File:USF_Mini_Baja_2004_Midwest_Testing.jpg">
            ChrisChow / USF Mini Baja
          </ExternalLink>
          <ExternalLink href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0, cropped</ExternalLink>
        </div>

        <div className="page-width footer-bottom">
          <span>Copyright {new Date().getFullYear()} SRJC Baja SAE Club</span>
          <span>Santa Rosa, California</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
