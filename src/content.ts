export type Update = {
  date: string;
  source: 'LinkedIn' | 'Instagram';
  title: string;
  href: string;
};

export type Subteam = {
  name: string;
  description: string;
};

export type Partner = {
  name: string;
  href: string;
  logo: string;
  tier: 'Platinum' | 'Gold' | 'Bronze' | 'Copper';
};

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export const updates: Update[] = [
  {
    date: 'May 17, 2026',
    source: 'Instagram',
    title: 'Finals week from SRJC Baja SAE',
    href: 'https://www.instagram.com/p/DYd1F7qI_y5',
  },
  {
    date: 'May 12, 2026',
    source: 'Instagram',
    title: 'Thank you to Ansys',
    href: 'https://www.instagram.com/p/DYQMWbVyKeF',
  },
  {
    date: 'Dec 20, 2025',
    source: 'LinkedIn',
    title: 'Fundraising for the Baja build',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7408172991966015490',
  },
];

export const subteams: Subteam[] = [
  {
    name: 'Chassis',
    description: 'Frame, roll-cage, packaging, structural design, and driver protection.',
  },
  {
    name: 'Powertrain',
    description: 'Engine, CVT, drivetrain, gearing, calibration, and power delivery.',
  },
  {
    name: 'Vehicle Dynamics',
    description: 'Suspension, steering, brakes, handling, geometry, and testing.',
  },
  {
    name: 'Manufacturing',
    description: 'Machining, welding, fabrication, assembly, and shop planning.',
  },
  {
    name: 'Electrical',
    description: 'Wiring, controls, instrumentation, sensors, and data acquisition.',
  },
  {
    name: 'Simulations',
    description: 'FEA, CFD, and other analysis used to evaluate designs before fabrication.',
  },
  {
    name: 'Business',
    description: 'Sponsorship, fundraising, communications, budgeting, and event planning.',
  },
];

export const partners: Partner[] = [
  {
    name: 'Designit Prototype',
    href: 'https://www.designitprototype.com/',
    logo: './assets/partner-designit.webp',
    tier: 'Platinum',
  },
  {
    name: 'SolidWorks',
    href: 'https://www.solidworks.com/',
    logo: './assets/partner-solidworks.webp',
    tier: 'Platinum',
  },
  {
    name: 'Altair (Siemens)',
    href: 'https://altair.com/',
    logo: './assets/partner-altair.png',
    tier: 'Platinum',
  },
  {
    name: 'Gene Haas Foundation',
    href: 'https://www.ghaasfoundation.org/',
    logo: './assets/partner-gene-haas.webp',
    tier: 'Gold',
  },
  {
    name: 'Sonoma Millworks',
    href: 'https://www.sonomamillworks.com/',
    logo: './assets/partner-sonoma-millworks.png',
    tier: 'Bronze',
  },
  {
    name: 'SWE SRJC',
    href: 'https://www.instagram.com/swesrjc/',
    logo: './assets/partner-swe-srjc.png',
    tier: 'Copper',
  },
];

export const galleryPhotos: GalleryPhoto[] = [
  {
    src: './assets/srjc-chassis.webp',
    alt: 'Two SRJC Baja SAE members standing behind the first vehicle chassis in the shop',
    caption: 'Developing SRJC\'s first chassis',
  },
  {
    src: './assets/srjc-mill.webp',
    alt: 'SRJC Baja SAE member operating a manual mill',
    caption: 'Machining components in the SRJC shop',
  },
  {
    src: './assets/srjc-fabrication.webp',
    alt: 'Two SRJC Baja SAE members preparing frame material at a fabrication table',
    caption: 'Preparing frame material for fabrication',
  },
  {
    src: './assets/srjc-tubing.webp',
    alt: 'SRJC Baja SAE member cutting steel tubing in the shop',
    caption: 'Cutting tubing for the vehicle frame',
  },
  {
    src: './assets/srjc-team.webp',
    alt: 'Five SRJC Baja SAE members together in the workshop',
    caption: 'The students behind SRJC Baja SAE',
  },
];

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/srjc-baja-sae-racing' },
  { label: 'Instagram', href: 'https://www.instagram.com/srjcsaeclub/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@srjcsaeclub' },
] as const;

export const canvasEnrollmentUrl = 'https://canvas.santarosa.edu/enroll/7LNWRL';
