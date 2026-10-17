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
  {
    id: 'nuxtathon2',
    name: 'Nuxtathon #2',
    url: 'https://github.com/nuxt/nuxt/issues/36438',
    participants: [
      { githubId: '48835293', username: 'DamianGlowala' },
      { githubId: '24661232', username: 'Jorgagu' },
      { githubId: '7257092', username: 'luc122c' },
      { githubId: '71938701', username: 'HugoRCD' },
      { githubId: '5265616', username: 'HtmAl' },
      { githubId: '739984', username: 'benjamincanac' },
      { githubId: '246458', username: '0xgdr' },
      { githubId: '10813063', username: 'Flo0806' },
      { githubId: '43837308', username: 'wattanx' },
      { githubId: '5326365', username: 'harlan-zw' },
      { githubId: '5103210', username: 'MickL' },
      { githubId: '39984251', username: 'Mini-ghost' },
      { githubId: '35223685', username: 'yamachi4416' },
      { githubId: '25185835', username: 'Redemption198' },
      { githubId: '22557931', username: 'sean0407' },
      { githubId: '55502199', username: 'EvanSchleret' },
      { githubId: '54577662', username: 'Aft1n' },
      { githubId: '93380643', username: 'axh-xecoy' },
      { githubId: '80774326', username: 'cristianchiriac' },
      { githubId: '83986256', username: 'devnoaman' },
      { githubId: '50110358', username: 'ianshk' },
      { githubId: '85992002', username: 'KazariEX' },
      { githubId: '40021217', username: 'kingyue737' },
      { githubId: '37299685', username: 'lokyiec' },
      { githubId: '50957031', username: 'oleksiizlotnik' },
      { githubId: '904724', username: 'atinux' },
      { githubId: '39545125', username: 'giaBaoJS' },
      { githubId: '1107521', username: 'hacknug' },
      { githubId: '15190246', username: 'hunterliu1003' },
      { githubId: '166915487', username: 'KazariAI' },
      { githubId: '171180614', username: 'kazbekaskarov' },
      { githubId: '7597086', username: 'mdanilowicz' },
      { githubId: '207940322', username: 'Neekoras' },
      { githubId: '3460368', username: 'nnx0r' },
      { githubId: '22072217', username: 'onmax' },
      { githubId: '32015025', username: 'sadfun' },
      { githubId: '3428674', username: 'Waschnick' },
      { githubId: '28706372', username: 'danielroe' },
      { githubId: '63512348', username: 'huang-julien' },
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
