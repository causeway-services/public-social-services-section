export default {
  configVersion: 1,
  site: {
    name: 'Turntide Islands',
    baseIri: 'https://turntide-islands.561.group/',
    language: 'en-US',
    license: 'All rights reserved',
    menu: [
      { label: 'Home', href: '/' },
      { label: 'Join', href: '/join/' },
      { label: 'Events', href: '/events/' },
      { label: 'The settlement', href: '/settlement/' },
      { label: 'Proof of Adaptation', href: '/proof-of-adaptation/' },
      { label: 'Governance', href: '/governance/' },
    ],
  },
  archives: { pageSize: 12 },
  pwa: {
    manifest: {
      name: 'Turntide Islands',
      shortName: 'Turntide',
      description: 'A public record of Turntide Islands and its work on climate adaptation.',
    },
  },
};
