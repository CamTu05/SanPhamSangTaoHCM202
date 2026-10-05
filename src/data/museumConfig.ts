export const BOARD_TYPOGRAPHY = {
  fontFamily: '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif',
  textureWidth: 1024,
  textureHeight: 1024,
  horizontalPadding: 88,
  numberSize: 32,
  numberLineHeight: 38,
  periodSize: 30,
  periodLineHeight: 38,
  titleSize: 46,
  titleLineHeight: 52,
  titleMaxLines: 4,
  bodySize: 27,
  bodyLineHeight: 42,
  bodyMaxLines: 8,
  numberY: 78,
  periodY: 130,
  titleTop: 202,
  separatorY: 466,
  bodyTop: 515
} as const

export const museumConfig = {
  colors: {
    ivory: '#d5cabb', wood: '#493428', dark: '#1b1714', bronze: '#a48252', warm: '#ffd59a', text: '#f0e9dd', secondary: '#beb3a3'
  },
  corridor: { width: 4.4, height: 3.8, start: 8, end: -94 },
  hall: { centerZ: -101, radius: 8, height: 6 },
  player: { eyeHeight: 1.68, radius: .4, speed: 2.6 },
  years: [
    { year: '1890', z: -4 }, { year: '1911', z: -16 }, { year: '1920', z: -32 }, { year: '1930', z: -49 },
    { year: '1941', z: -65 }, { year: '1945', z: -73 }, { year: '1954', z: -78 }, { year: '1969', z: -86 }
  ]
} as const
