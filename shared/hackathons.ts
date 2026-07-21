export interface HackathonParticipant {
  githubId: string
  username: string
}

export interface Hackathon {
  /** Also used as the key for the Discord role ID in runtime config, so it must be env-var safe. */
  id: string
  name: string
  url: string
  participants: HackathonParticipant[]
}

export const hackathons: Hackathon[] = [
  {
    id: 'nuxtathon1',
    name: 'Nuxtathon #1',
    url: 'https://github.com/nuxt/nuxt/issues/35561',
    participants: [
      { githubId: '10813063', username: 'Flo0806' },
      { githubId: '89837724', username: 'Norbiros' },
      { githubId: '25607142', username: 'Mateleo' },
      { githubId: '37191683', username: 'OrbisK' },
      { githubId: '112722215', username: 'cernymatej' },
      { githubId: '245008322', username: 'stephanelgrg' },
      { githubId: '7257092', username: 'luc122c' },
      { githubId: '1107521', username: 'hacknug' },
      { githubId: '59548500', username: 'KealanAU' },
      { githubId: '5794325', username: 'yschroe' },
      { githubId: '21310742', username: 'MirkoJa' },
      { githubId: '24661232', username: 'Jorgagu' },
      { githubId: '48835293', username: 'DamianGlowala' },
      { githubId: '114825598', username: 'DarlanPrado' },
      { githubId: '2138260', username: 'Ibochkarev' },
      { githubId: '50132270', username: 'abaza738' },
      { githubId: '18102267', username: 'oritwoen' },
      { githubId: '22072217', username: 'onmax' },
      { githubId: '6538827', username: 'bdbch' },
      { githubId: '34019878', username: 'martinszeltins' },
      { githubId: '87276663', username: 'lorypelli' },
      { githubId: '22201189', username: 'lutejka' },
      { githubId: '58456495', username: 'chairulakmal' },
      { githubId: '35817344', username: 'chstappert' },
      { githubId: '7356077', username: 'connerblanton' },
      { githubId: '16652879', username: 'DevilTea' },
      { githubId: '85992002', username: 'KazariEX' },
      { githubId: '31246997', username: 'Niki2k1' },
      { githubId: '27751688', username: 'oneminch' },
      { githubId: '1766126', username: 'sumerokr' },
      { githubId: '43837308', username: 'wattanx' },
      { githubId: '35223685', username: 'yamachi4416' },
      { githubId: '28706372', username: 'danielroe' },
      { githubId: '5326365', username: 'harlan-zw' },
      { githubId: '640208', username: 'TheAlexLichter' },
      { githubId: '63512348', username: 'huang-julien' },
      { githubId: '1377702', username: 'serhalp' },
    ],
  },
]

export function getHackathonsForUser(githubId: string | number | undefined): Hackathon[] {
  if (!githubId) {
    return []
  }
  const id = String(githubId)
  return hackathons.filter(hackathon => hackathon.participants.some(p => p.githubId === id))
}
