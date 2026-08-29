import { useRef, useState } from 'react';
import {
  canvasEnrollmentUrl,
  galleryPhotos,
  partners,
  socialLinks,
  subteams,
  updates,
} from './content';
import { formatEventDate, formatEventTime, getUpcomingEvents } from './calendar';

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Updates', href: '#updates' },
  { label: 'Team', href: '#team' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Calendar', href: '#calendar' },
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

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const upcomingEvents = getUpcomingEvents(6);

  const closeMenu = () => setMenuOpen(false);
  const showPreviousPhoto = () => {
    setActivePhoto((current) => (current - 1 + galleryPhotos.length) % galleryPhotos.length);
  };
  const showNextPhoto = () => {
    setActivePhoto((current) => (current + 1) % galleryPhotos.length);
  };

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
                <p className="eyebrow">Inside the shop</p>
                <h2>Students doing the work</h2>
              </div>
              <p className="section-aside">
                SRJC students design, machine, fabricate, and assemble the car in our campus shop.
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
                  {'<'}
                </button>
                <button className="gallery-arrow gallery-arrow-next" type="button" onClick={showNextPhoto} aria-label="Show next photo">
                  {'>'}
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
                    {'>'}
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
                <a className="text-link" href="#events">View upcoming events</a>
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
                <h3 id="events-heading">Upcoming events</h3>
                <small>Synced from Canvas</small>
              </div>
              {upcomingEvents.length > 0 ? (
                <ol className="calendar-event-list">
                  {upcomingEvents.map((event) => (
                    <li className="calendar-event" key={event.id}>
                      <time className="calendar-event-date" dateTime={event.start}>
                        {formatEventDate(event)}
                      </time>
                      <div className="calendar-event-body">
                        <h3>{event.title}</h3>
                        <p>{formatEventTime(event)}</p>
                        {event.location ? <p>{event.location}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="calendar-empty">
                  <h3>No upcoming events are listed yet.</h3>
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
