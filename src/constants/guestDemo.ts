export const GUEST_SAMPLE_PROFILE_SLUG = 'demo';

export const GUEST_DEMO_QR_CODES = [
  {
    id: 'demo-profile',
    label: 'Sample NFC identity',
    payload: `https://biocloud.app/c/${GUEST_SAMPLE_PROFILE_SLUG}`,
    slug: GUEST_SAMPLE_PROFILE_SLUG,
  },
  {
    id: 'demo-creator',
    label: 'Creator preview',
    payload: 'https://biocloud.app/c/sitehub-creator',
    slug: 'sitehub-creator',
  },
] as const;

export const GUEST_DEMO_CONNECTIONS = [
  {
    id: 'conn-1',
    name: 'Sok Dara',
    subtitle: 'Met at Tech Expo · NFC tap',
    when: '2h ago',
    slug: GUEST_SAMPLE_PROFILE_SLUG,
  },
  {
    id: 'conn-2',
    name: 'Mina Chen',
    subtitle: 'QR scan · Product launch',
    when: 'Yesterday',
    slug: 'sitehub-creator',
  },
  {
    id: 'conn-3',
    name: 'Alex Rivera',
    subtitle: 'Shared profile link',
    when: '3 days ago',
    slug: 'demo',
  },
] as const;

export const GUEST_DEMO_ANALYTICS = {
  profileViews: 1284,
  nfcTaps: 342,
  qrScans: 891,
  contactSaves: 67,
  topSources: [
    { label: 'NFC tap', value: 42 },
    { label: 'QR scan', value: 35 },
    { label: 'Direct link', value: 23 },
  ],
  weeklyViews: [42, 58, 71, 63, 88, 95, 102],
} as const;
