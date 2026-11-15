/**
 * Every profile the site links to, in footer order.
 *
 * The single list behind both the footer icons and the `sameAs` of the
 * `Person` in the site's JSON-LD. Those used to be two hand-kept copies, and
 * the structured data fell two profiles behind the footer without anything
 * noticing.
 *
 * `invertInDark` is for the monochrome marks only — inverting a brand colour
 * (Spotify green, Instagram's gradient, the LinkedIn blue, Strava orange) would
 * misrender it.
 */
export const SOCIAL_LINKS = [
  {
    href: 'https://github.com/acp9191',
    label: 'GitHub',
    icon: '/icons/github.svg',
    invertInDark: true,
  },
  {
    href: 'https://open.spotify.com/user/acp9191',
    label: 'Spotify',
    icon: '/icons/spotify.svg',
    invertInDark: false,
  },
  {
    href: 'https://linkedin.com/in/acp',
    label: 'LinkedIn',
    icon: '/icons/linkedin.png',
    invertInDark: false,
  },
  {
    href: 'https://www.instagram.com/acp.jpg',
    label: 'Instagram',
    icon: '/icons/instagram.svg',
    invertInDark: false,
  },
  {
    href: 'https://www.strava.com/athletes/65729171',
    label: 'Strava',
    icon: '/icons/strava.svg',
    invertInDark: false,
  },
  { href: 'https://x.com/acp9191', label: 'X', icon: '/icons/x.svg', invertInDark: true },
] as const;
