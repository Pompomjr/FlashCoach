/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Platform } from 'react-native';

import Layout from '../app/_layout';
import Depart from '../app/index';
import Bravo from '../app/bravo';
import Journal from '../app/journal';
import EcranSeance from '../app/seance';
import { CLE_JOURNAL } from '../src/journal/journal';
import { stockageTelephone } from '../src/preferences/stockage';
import { demanderSynchro } from '../src/synchro/instance';
import { fabriquerEntree } from '../src/test-utils/journal';

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('../src/synchro/instance', () => ({ authApp: null, moteurApp: null, demanderSynchro: jest.fn() }));
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Pictogrammes et emoji : plus aucun dans l'interface.
const EMOJI = new RegExp(String.raw`\p{Extended_Pictographic}|[✓‹]`, 'u');

const memoire = stockageTelephone as unknown as { contenu: Record<string, string> };
const ROUTES = { _layout: Layout, index: Depart, seance: EcranSeance, bravo: Bravo, journal: Journal };
const SEANCE = '/seance?objectif=calories&duree=5&graine=1';
const journalEnMemoire = () => JSON.parse(memoire.contenu[CLE_JOURNAL] ?? '[]');

// Le compteur est remis à zéro : un espion déjà posé par un test précédent garderait son historique.
function espionnerAnnonces() {
  const espion = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  espion.mockClear();
  return espion;
}

beforeEach(() => {
  for (const cle of Object.keys(memoire.contenu)) delete memoire.contenu[cle];
  jest.mocked(Haptics.impactAsync).mockClear();
  jest.mocked(Haptics.notificationAsync).mockClear();
  jest.mocked(demanderSynchro).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('écran de départ', () => {
  it('présélectionne À la maison, Mou et 5 min au premier lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'À la maison' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Mou' })).toBeSelected();
    expect(screen.getByRole('button', { name: '5 min' })).toBeSelected();
  });

  it('reprend les derniers choix', async () => {
    memoire.contenu['flashcoach.choix'] = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 15 });
    await renderRouter(ROUTES, { initialUrl: '/' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Au réveil' })).toBeSelected());
    expect(screen.getByRole('button', { name: 'Raide' })).toBeSelected();
    expect(screen.getByRole('button', { name: '15 min' })).toBeSelected();
  });

  it('affiche la marque en titre, avec le slogan dessous', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'Flash Coach' })).toBeTruthy();
    expect(screen.getByText('Où que tu sois, 5 minutes pour te sentir mieux.')).toBeTruthy();
  });

  it('centre le logo et le nom, avec « Mon journal » en bouton icône et des titres de section', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const marque = await screen.findByRole('header', { name: 'Flash Coach' });
    expect(within(marque).getByText('Flash Coach', { includeHiddenElements: true })).toBeTruthy();
    const journal = screen.getByRole('button', { name: 'Mon journal' });
    expect(within(journal).getByTestId('icone-journal', { includeHiddenElements: true })).toBeTruthy();
    expect(journal).toHaveStyle({ width: 48, height: 48, position: 'absolute' });
    expect(screen.queryByText('Mon journal')).toBeNull();
    for (const titre of ['Où es-tu ?', 'Comment tu te sens ?', 'Combien de temps ?']) {
      expect(screen.getByRole('header', { name: titre })).toBeTruthy();
    }
  });

  it('dessine une icône sur chaque carte de contexte et de ressenti, sans emoji', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await screen.findByRole('button', { name: 'À la maison' });
    for (const nom of ['reveil', 'maison', 'cadenas', 'raide', 'stresse', 'mou', 'en_forme', 'journal']) {
      expect(screen.getAllByTestId(`icone-${nom}`, { includeHiddenElements: true }).length).toBeGreaterThan(0);
    }
    // Les trois contextes Premium montrent le cadenas, pas leur icône.
    expect(screen.getAllByTestId('icone-cadenas', { includeHiddenElements: true })).toHaveLength(3);
    for (const nom of ['bureau', 'voyage', 'dehors']) {
      expect(screen.queryByTestId(`icone-${nom}`, { includeHiddenElements: true })).toBeNull();
    }
    expect(screen.queryAllByText(EMOJI)).toHaveLength(0);
  });

  it('lance la séance en un seul tap et retient les choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(JSON.parse(memoire.contenu['flashcoach.choix'])).toEqual({ contexteId: 'maison', ressenti: 'mou', duree: 5 });
  });

  it('annonce Premium sans changer la sélection', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'À la maison' })).toBeSelected();
  });

  it('ne laisse pas la lecture des préférences écraser un choix déjà fait', async () => {
    memoire.contenu['flashcoach.choix'] = JSON.stringify({ contexteId: 'reveil', ressenti: 'raide', duree: 15 });
    const stockage = stockageTelephone as unknown as { lire: (cle: string) => Promise<string | null> };
    const lireOrigine = stockage.lire;
    let liberer: () => void = () => undefined;
    const porte = new Promise<void>((resolve) => {
      liberer = resolve;
    });
    stockage.lire = async (cle) => {
      await porte;
      return lireOrigine(cle);
    };
    try {
      await renderRouter(ROUTES, { initialUrl: '/' });
      await fireEvent.press(await screen.findByRole('button', { name: 'En forme' }));
      await act(async () => {
        liberer();
        await porte;
      });
      expect(screen.getByRole('button', { name: 'En forme' })).toBeSelected();
      expect(screen.getByRole('button', { name: 'À la maison' })).toBeSelected();
    } finally {
      stockage.lire = lireOrigine;
    }
  });

  it('efface le message Premium dès qu’on fait un autre choix', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Raide' }));
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
  });

  it('accompagne « Bientôt avec Premium » du cadenas', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    const message = screen.getByText('Bientôt avec Premium');
    expect(message).toBeTruthy();
    // 3 cartes verrouillées + le cadenas du message.
    expect(screen.getAllByTestId('icone-cadenas', { includeHiddenElements: true })).toHaveLength(4);
  });

  it('annonce le message Premium aux lecteurs d’écran (iOS)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(annonce).toHaveBeenCalledWith('Bientôt avec Premium');
  });

  it('n’annonce pas deux fois le message Premium sur Android (zone live déjà en place)', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();
  });

  it('ne lance qu’une séance malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const lancer = await screen.findByRole('button', { name: 'Lancer ma séance' });
    await fireEvent.press(lancer);
    await fireEvent.press(lancer);
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });
});

describe('niveau au départ', () => {
  const NOM_PASTILLE = /^Niveau .*, modifier$/;

  it('montre « Niveau Léger » par défaut', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'Niveau Léger, modifier' })).toBeTruthy();
    expect(screen.getByText('Niveau Léger')).toBeTruthy();
  });

  it('ouvre la feuille des niveaux, avec le niveau courant marqué', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: NOM_PASTILLE }));
    expect(screen.getByRole('button', { name: 'Léger : on bouge sans forcer' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Moyen : ça chauffe un peu' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Lourd : pour celles et ceux qui s’entraînent déjà' })).not.toBeSelected();
  });

  it('ferme la feuille sans rien changer au tap extérieur', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: NOM_PASTILLE }));
    await fireEvent.press(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('button', { name: 'Moyen : ça chauffe un peu' })).toBeNull();
    expect(memoire.contenu['flashcoach.niveau']).toBeUndefined();
  });

  it('choisit « Lourd », l’enregistre et le passe au lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: NOM_PASTILLE }));
    await fireEvent.press(screen.getByRole('button', { name: /^Lourd/ }));
    expect(await screen.findByRole('button', { name: 'Niveau Lourd, modifier' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Moyen/ })).toBeNull();
    await waitFor(() => expect(memoire.contenu['flashcoach.niveau']).toBe('3'));
    await fireEvent.press(screen.getByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(screen).toHaveSearchParams(expect.objectContaining({ niveau: '3' }));
  });

  it('reprend le niveau enregistré', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    await renderRouter(ROUTES, { initialUrl: '/' });
    expect(await screen.findByRole('button', { name: 'Niveau Moyen, modifier' })).toBeTruthy();
  });

  it('affiche le nouveau niveau au retour d’une séance où Bravo l’a modifié', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await screen.findByRole('button', { name: 'Niveau Léger, modifier' });
    await act(() => router.push('/bravo?minutes=5&exercices=8'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Trop facile' }));
    await screen.findByText('Prochaine séance : niveau Moyen');
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    expect(await screen.findByRole('button', { name: 'Niveau Moyen, modifier' })).toBeTruthy();
  });

  it('attend que Bravo ait enregistré le niveau avant de repartir, même si on enchaîne vite', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await screen.findByRole('button', { name: 'Niveau Léger, modifier' });
    await act(() => router.push('/bravo?minutes=5&exercices=8'));
    // L'écriture du niveau est retenue : « Et on est repartis » tapé avant qu'elle n'aboutisse ne doit rien lancer.
    let enregistrer = () => {};
    const retenue = new Promise<void>((resoudre) => {
      enregistrer = resoudre;
    });
    const ecrire = stockageTelephone.ecrire.bind(stockageTelephone);
    jest.spyOn(stockageTelephone, 'ecrire').mockImplementation(async (cle, valeur) => {
      if (cle === 'flashcoach.niveau') await retenue;
      await ecrire(cle, valeur);
    });

    await fireEvent.press(await screen.findByRole('button', { name: 'Trop facile' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await act(async () => {
      for (let i = 0; i < 5; i++) await Promise.resolve();
    });
    expect(screen).toHavePathname('/bravo');
    expect(memoire.contenu['flashcoach.niveau']).toBeUndefined();

    await act(async () => enregistrer());
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(await screen.findByRole('button', { name: 'Niveau Moyen, modifier' })).toBeTruthy();
    expect(memoire.contenu['flashcoach.niveau']).toBe('2');
  });
});

describe('écran de séance', () => {
  it('démarre la séance avec le compteur et le minuteur', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?objectif=calories&duree=5&graine=1' });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    expect(screen.getByText('0:05')).toBeTruthy();
  });

  it('montre « Terminer » sur une ligne, lu « Terminer la séance », et la phase dans l’en-tête', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    const terminer = await screen.findByRole('button', { name: 'Terminer la séance' });
    expect(within(terminer).getByText('Terminer')).toBeTruthy();
    expect(screen.queryByText('Terminer la séance')).toBeNull();
    expect(screen.getByText('Mise en route · ')).toBeTruthy();
  });

  it('demande une synchro au démarrage', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await waitFor(() => expect(demanderSynchro).toHaveBeenCalled());
  });

  it('renvoie au départ si les paramètres sont invalides', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?objectif=lune&duree=5&graine=1' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('renvoie au départ sur un ancien lien par contexte et ressenti, sans objectif', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?contexte=reveil&ressenti=mou&duree=5&graine=1' });
    await waitFor(() => expect(screen).toHavePathname('/'));
  });

  it('joue une séance de 15 minutes en tours', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?objectif=etirements&duree=15&graine=1' });
    expect(await screen.findByText('1 / 17')).toBeTruthy();
  });

  it('termine la séance et affiche le bilan', async () => {
    await renderRouter(ROUTES, { initialUrl: '/seance?objectif=calories&duree=5&graine=1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(screen.getByText('Pas grave, on remet ça quand tu veux.')).toBeTruthy();
  });

  it('demande une synchro à la fin de la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await waitFor(() => expect(demanderSynchro).toHaveBeenCalled());
    const avant = jest.mocked(demanderSynchro).mock.calls.length;
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    await waitFor(() => expect(demanderSynchro).toHaveBeenCalledTimes(avant + 1));
  });

  it('annonce la pause aux lecteurs d’écran (iOS)', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pause' }));
    expect(screen.getByText('En pause')).toBeTruthy();
    expect(annonce).toHaveBeenCalledWith('En pause');
  });

  it('n’annonce pas la pause deux fois sur Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pause' }));
    expect(screen.getByText('En pause')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();
  });

  it('quitte vers le départ sur un lien direct, sans historique', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await fireEvent.press(await screen.findByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});

describe('effets de la séance', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('ne vibre pas au démarrage, puis vibre au passage de la transition à l’effort', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('0:05')).toBeTruthy();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('annonce l’exercice à chaque changement d’étape sur iOS, pas au démarrage', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const annonce = espionnerAnnonces();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('0:05')).toBeTruthy();
    expect(annonce).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(annonce).toHaveBeenCalledTimes(1);
    expect(annonce).toHaveBeenCalledWith(expect.stringMatching(/\S/));
  });

  it('montre la figurine figée pendant « À suivre », animée pendant l’effort, figée en pause', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    // Pas d'étiquette au-dessus du nom : « À suivre » est porté par le titre, la phase par l'en-tête.
    expect(await screen.findByText(/^À suivre\s*: /)).toBeTruthy();
    expect(screen.getByText('Mise en route · ')).toBeTruthy();
    const instantane = () => JSON.stringify(screen.getByRole('image', { name: /^Illustration : / }));
    const transition = instantane();
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    expect(instantane()).toBe(transition);

    await act(async () => {
      jest.advanceTimersByTime(3600);
    });
    expect(screen.queryByText(/^À suivre/)).toBeNull();
    const effort = instantane();
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    expect(instantane()).not.toBe(effort);

    await fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    const pause = instantane();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(instantane()).toBe(pause);
  });

  it('retient les exercices de la séance pour la prochaine fois', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    const ids = JSON.parse(memoire.contenu['flashcoach.derniers-exercices']) as string[];
    expect(ids).toHaveLength(8);
    expect(ids.every((id) => typeof id === 'string' && id !== '')).toBe(true);
  });

  it('mène au bilan quand la séance va jusqu’au bout', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: SEANCE });
    expect(await screen.findByText('1 / 8')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(300_000);
    });
    expect(screen).toHavePathname('/bravo');
    expect(getSearchParams()).toEqual({ minutes: '5', exercices: '8', secondes: '300', seance: journalEnMemoire()[0].id, niveau: '1' });
  });
});

describe('écran Bravo', () => {
  it('résume la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('5 min · 8 exercices')).toBeTruthy();
  });

  it('remercie après la réponse à « Tu te sens mieux ? »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('félicite après des minutes d’effort sans exercice complet', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=3&exercices=0' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('3 min')).toBeTruthy();
    expect(screen.queryByText('À bientôt !')).toBeNull();
  });

  it('reste doux quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.getByText('Pas grave, on remet ça quand tu veux.')).toBeTruthy();
  });

  it('cache la coche décorative aux lecteurs d’écran', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('célèbre une séance faite : confettis et vibration de réussite, une seule fois', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId('confettis', { includeHiddenElements: true })).toBeTruthy());
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('ne lance ni confettis ni vibration quand rien n’a été fait', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTestId('confettis', { includeHiddenElements: true })).toBeNull();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('ne lance pas de confettis quand les animations sont réduites', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByTestId('confettis', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByTestId('icone-coche', { includeHiddenElements: true })).toBeTruthy();
  });

  it('absorbe une vibration impossible', async () => {
    jest.mocked(Haptics.notificationAsync).mockRejectedValueOnce(new Error('indisponible'));
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Et on est repartis' })).toBeTruthy();
  });

  it('repart vers le départ', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
  });
});

describe('Bravo : l’effort', () => {
  const niveauEnMemoire = () => memoire.contenu['flashcoach.niveau'];

  it('propose « L’effort ? » avec trois réponses sous « Tu te sens mieux ? »', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    expect(await screen.findByText('L’effort ?')).toBeTruthy();
    for (const nom of ['Trop facile', 'Juste bien', 'Trop dur']) {
      expect(screen.getByRole('button', { name: nom })).toBeTruthy();
    }
  });

  it('monte le niveau sur « Trop facile » et l’annonce', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Trop facile' }));
    expect(await screen.findByText('Prochaine séance : niveau Moyen')).toBeTruthy();
    expect(niveauEnMemoire()).toBe('2');
    expect(screen.queryByRole('button', { name: 'Trop facile' })).toBeNull();
  });

  it('dit « Noté ! » quand « Trop dur » ne peut pas descendre sous le niveau 1', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Trop dur' }));
    expect(await screen.findByText('Noté !')).toBeTruthy();
    expect(niveauEnMemoire()).toBeUndefined();
  });

  it('descend le niveau sur « Trop dur »', async () => {
    memoire.contenu['flashcoach.niveau'] = '3';
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Trop dur' }));
    expect(await screen.findByText('Prochaine séance : niveau Moyen')).toBeTruthy();
    expect(niveauEnMemoire()).toBe('2');
  });

  it('dit « Noté ! » sur « Juste bien » sans toucher au niveau', async () => {
    memoire.contenu['flashcoach.niveau'] = '2';
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Juste bien' }));
    expect(await screen.findByText('Noté !')).toBeTruthy();
    expect(niveauEnMemoire()).toBe('2');
  });

  it('enregistre l’effort dans le journal et demande une synchro', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    const avant = jest.mocked(demanderSynchro).mock.calls.length;
    await fireEvent.press(await screen.findByRole('button', { name: 'Juste bien' }));
    await waitFor(() => expect(journalEnMemoire()[0].effort).toBe('juste'));
    await waitFor(() => expect(demanderSynchro).toHaveBeenCalledTimes(avant + 1));
  });

  it('garde les deux questions indépendantes', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Trop facile' }));
    await screen.findByText('Prochaine séance : niveau Moyen');
    expect(screen.getByRole('button', { name: 'Mieux' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0]).toMatchObject({ apres: 'mieux', effort: 'facile' }));
  });

  it('ne pose pas la question d’effort quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('L’effort ?')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Trop facile' })).toBeNull();
  });
});

describe('retour au départ après une séance', () => {
  it('revient au départ existant sans empiler un second écran', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('efface le message Premium au retour sur le départ', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Au bureau, Premium' }));
    expect(screen.getByText('Bientôt avec Premium')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(screen.queryByText('Bientôt avec Premium')).toBeNull();
  });

  it('relit les derniers exercices au retour : ceux de la séance qui vient d’avoir lieu', async () => {
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const vus = JSON.parse(memoire.contenu['flashcoach.derniers-exercices']) as string[];
    expect(vus.length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByRole('button', { name: 'Et on est repartis' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Lancer ma séance' }));
    await waitFor(() => expect(screen).toHavePathname('/seance'));
    expect(getSearchParams().exclure).toBe(vus.join(','));
  });
});

describe('journal : enregistrement', () => {
  it('crée une entrée écourtée dès le début de la séance', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await waitFor(() => expect(journalEnMemoire()).toHaveLength(1));
    expect(journalEnMemoire()[0]).toMatchObject({
      // Provisoire (lot 2 : entrée par objectif) : une séance « calories » s'inscrit « maison · en forme ».
      contexteId: 'maison',
      ressenti: 'en_forme',
      duree: 5,
      graine: 1,
      terminee: false,
      apres: null,
      ecouleMs: 0,
      exercicesFaits: 0,
    });
    expect(journalEnMemoire()[0].exercices).toHaveLength(8);
  });

  it('marque la séance allée au bout et passe son identifiant à Bravo', async () => {
    jest.useFakeTimers();
    const { getSearchParams } = await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(301000);
    });
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    const [entree] = journalEnMemoire();
    expect(journalEnMemoire()).toHaveLength(1);
    expect(entree).toMatchObject({ terminee: true, exercicesFaits: 8, ecouleMs: 300000 });
    expect(getSearchParams().seance).toBe(entree.id);
  });

  it('garde la séance écourtée quand on termine avant la fin', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Terminer la séance' }));
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(journalEnMemoire()).toHaveLength(1);
    expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000, exercicesFaits: 0 });
  });

  it('garde le temps fait quand on quitte la séance', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await act(async () => {
      jest.advanceTimersByTime(7000);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Quitter la séance' }));
    await waitFor(() => expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, ecouleMs: 7000 }));
    expect(journalEnMemoire()).toHaveLength(1);
  });

  it('garde la séance écourtée quand on enchaîne « Passer » jusqu’à la fin', async () => {
    jest.useFakeTimers();
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    for (let i = 0; i < 8; i += 1) {
      await fireEvent.press(await screen.findByRole('button', { name: 'Passer' }));
    }
    await waitFor(() => expect(screen).toHavePathname('/bravo'));
    expect(journalEnMemoire()).toHaveLength(1);
    expect(journalEnMemoire()[0]).toMatchObject({ terminee: false, exercicesFaits: 0 });
  });

  it('enregistre la réponse « Pareil »', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pareil' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('pareil'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('remercie sans rien écrire quand Bravo n’a pas d’identifiant de séance', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    expect(screen.getByText('Merci !')).toBeTruthy();
    expect(memoire.contenu[CLE_JOURNAL]).toBeUndefined();
  });

  it('enregistre la réponse à « Tu te sens mieux ? »', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1' })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=5&exercices=8&seance=e1' });
    const avant = jest.mocked(demanderSynchro).mock.calls.length;
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('mieux'));
    await waitFor(() => expect(demanderSynchro).toHaveBeenCalledTimes(avant + 1));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('pose la question dès 10 secondes d’activité, même sans minute ni exercice complet', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'e1', terminee: false })]);
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0&secondes=20&seance=e1' });
    expect(await screen.findByText('Bravo !')).toBeTruthy();
    expect(screen.getByText('Moins d’une minute')).toBeTruthy();
    await fireEvent.press(await screen.findByRole('button', { name: 'Mieux' }));
    await waitFor(() => expect(journalEnMemoire()[0].apres).toBe('mieux'));
    expect(screen.getByText('Merci !')).toBeTruthy();
  });

  it('ne pose pas la question sous 10 secondes sans exercice', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0&secondes=3&seance=e1' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('Tu te sens mieux ?')).toBeNull();
  });

  it('ne pose pas la question quand rien n’a été fait', async () => {
    await renderRouter(ROUTES, { initialUrl: '/bravo?minutes=0&exercices=0' });
    expect(await screen.findByText('À bientôt !')).toBeTruthy();
    expect(screen.queryByText('Tu te sens mieux ?')).toBeNull();
  });
});

describe('journal : niveau', () => {
  it('enregistre le niveau de la séance, sans effort au départ', async () => {
    await renderRouter(ROUTES, { initialUrl: `${SEANCE}&niveau=2` });
    await screen.findByRole('timer');
    await waitFor(() => expect(journalEnMemoire()[0]).toMatchObject({ niveau: 2, effort: null }));
  });

  it('prend le niveau 1 quand l’URL n’en a pas', async () => {
    await renderRouter(ROUTES, { initialUrl: SEANCE });
    await screen.findByRole('timer');
    await waitFor(() => expect(journalEnMemoire()[0].niveau).toBe(1));
  });
});

describe('écran Mon journal', () => {
  it('s’ouvre depuis le départ sans gêner le lancement', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Mon journal' }));
    await waitFor(() => expect(screen).toHavePathname('/journal'));
  });

  it('n’ouvre qu’un seul journal malgré un double appui', async () => {
    await renderRouter(ROUTES, { initialUrl: '/' });
    const lien = await screen.findByRole('button', { name: 'Mon journal' });
    await fireEvent.press(lien);
    await fireEvent.press(lien);
    await waitFor(() => expect(screen).toHavePathname('/journal'));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour' }));
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(router.canGoBack()).toBe(false);
  });

  it('rend chaque séance lisible d’un seul bloc par les lecteurs d’écran', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'a', apres: 'mieux' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByLabelText('dim. 18 oct. à 7h05, À la maison, Mou, puis Mieux, 5 min, 8 exercices')).toBeTruthy();
  });

  it('ne propose pas la sauvegarde sans Supabase', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Ta première séance apparaîtra ici.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
  });

  it('ne propose pas la sauvegarde sans Supabase, journal rempli', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([fabriquerEntree({ id: 'a' })]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText(/séance/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
  });

  it('invite à faire une première séance quand il est vide', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Ta première séance apparaîtra ici.')).toBeTruthy();
    // La figurine au repos est un décor : visible, mais pas lue par les lecteurs d'écran.
    expect(screen.queryByRole('image', { name: 'Illustration : Figurine au repos' })).toBeNull();
    expect(screen.getByLabelText('Illustration : Figurine au repos', { includeHiddenElements: true })).toBeTruthy();
  });

  it('montre la preuve de la promesse et les séances', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil', contexteId: 'reveil', ressenti: 'raide' }),
      fabriquerEntree({ id: 'c', apres: null, terminee: false, ecouleMs: 20000, exercicesFaits: 0 }),
    ]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Séances qui t’ont fait du bien : 1 sur 2')).toBeTruthy();
    expect(screen.getByText('À la maison · Mou → Mieux')).toBeTruthy();
    expect(screen.getByText('Au réveil · Raide → Pareil')).toBeTruthy();
    expect(screen.getByText('Moins d’une minute · écourtée')).toBeTruthy();
    expect(screen.getAllByText('dim. 18 oct. · 7h05')).toHaveLength(3);
  });

  it('marque chaque ligne de l’icône du contexte et d’une seule pastille de réponse, sans emoji', async () => {
    memoire.contenu[CLE_JOURNAL] = JSON.stringify([
      fabriquerEntree({ id: 'a', apres: 'mieux' }),
      fabriquerEntree({ id: 'b', apres: 'pareil', contexteId: 'reveil', ressenti: 'raide' }),
    ]);
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await screen.findByText('À la maison · Mou → Mieux');
    const toutes = { includeHiddenElements: true };
    for (const nom of ['maison', 'reveil', 'pareil']) {
      expect(screen.getAllByTestId(`icone-${nom}`, toutes)).toHaveLength(1);
    }
    // Le ressenti est dit par le texte (« Mou → Mieux ») : pas d'icône en double, ni de chevron.
    for (const nom of ['mou', 'raide', 'retour']) {
      expect(screen.queryAllByTestId(`icone-${nom}`, toutes).length).toBeLessThanOrEqual(nom === 'retour' ? 1 : 0);
    }
    // « Mieux » : la ligne, plus l'icône forte de la carte de résumé.
    expect(screen.getAllByTestId('icone-mieux', toutes)).toHaveLength(2);
    expect(screen.queryAllByText(EMOJI)).toHaveLength(0);
  });
});
