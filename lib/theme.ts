export const theme = {
  // Medhavy Guardian palette — swap these to rebrand the entire site
  // Guardian structure: deep forest replaces sapphire, brick replaces red,
  // ochre replaces neon yellow, warm taupe/stone for grays
  colors: {
    bb1: '#121212',   // iron black — primary text
    bb2: '#1F3D1A',   // deep forest — primary accent, headers
    bb3: '#8C3422',   // brick — alert, danger, emphasis
    bb4: '#C8860E',   // warm ochre — highlight, callout
    bb5: '#5C5A4E',   // warm taupe — secondary accent
    bb6: '#8C8878',   // warm stone — muted accent
    bb7: '#999387',   // warm pebble — borders
    bb8: '#FFFFFF',   // white — page background, light surfaces
  },
  // Semantic aliases — use these in components, not raw hex
  semantic: {
    text:        'bb1',
    accent:      'bb2',
    danger:      'bb3',
    highlight:   'bb4',
    secondary:   'bb5',
    muted:       'bb6',
    border:      'bb7',
    background:  'bb8',
  },
} as const

export type Theme = typeof theme
