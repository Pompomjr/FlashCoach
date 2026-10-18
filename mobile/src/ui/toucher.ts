import { Platform } from 'react-native';

// Retours tactiles communs : ondulation Material sur Android, léger enfoncement ailleurs (web, iOS).

// Ondulation tirée de la couleur du texte de l'élément (« #RRGGBB »), non bordée : elle reste dans la forme.
export function ondulation(couleurTexte: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(couleurTexte.slice(i, i + 2), 16));
  return { color: `rgba(${r}, ${g}, ${b}, 0.16)`, borderless: false } as const;
}

// Échelle au toucher : Android a déjà son ondulation, pas de double effet.
export function enfoncement(presse: boolean) {
  return presse && Platform.OS !== 'android' ? ({ transform: [{ scale: 0.98 }] } as const) : null;
}
