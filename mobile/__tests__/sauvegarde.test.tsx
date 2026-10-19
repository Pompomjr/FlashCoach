/// <reference path="../node_modules/expo-router/build/ts-declarations/expect.d.ts" />
import { fireEvent, waitFor } from '@testing-library/react-native';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import Journal from '../app/journal';
import Sauvegarde from '../app/sauvegarde';
import { AuthMemoire } from '../src/compte/authMemoire';
import { ErreurCompte } from '../src/compte/auth';

const mockAuth = new AuthMemoire();
const mockRestaurer = jest.fn(async () => true);
const mockProgrammer = jest.fn(async () => undefined);

jest.mock('../src/preferences/stockage', () => {
  const { creerStockageMemoire } = jest.requireActual('../src/test-utils/stockageMemoire');
  return { stockageTelephone: creerStockageMemoire() };
});
jest.mock('../src/synchro/instance', () => ({
  get authApp() {
    return mockAuth;
  },
  moteurApp: { demanderSynchro: jest.fn(async () => undefined), programmerRestauration: () => mockProgrammer(), restaurerApresConnexion: () => mockRestaurer() },
  demanderSynchro: jest.fn(),
}));

const ROUTES = { journal: Journal, sauvegarde: Sauvegarde };

beforeEach(() => {
  mockAuth.etat = { utilisateurId: 'anonyme-1', email: null, anonyme: true };
  mockAuth.comptes.clear();
  mockAuth.enPanne = false;
  mockRestaurer.mockClear();
  mockProgrammer.mockClear();
});

async function saisirEmail(email: string) {
  await renderRouter(ROUTES, { initialUrl: '/sauvegarde' });
  await fireEvent.changeText(screen.getByLabelText('Adresse e-mail'), email);
  await fireEvent.press(screen.getByRole('button', { name: 'Recevoir mon code' }));
}

describe('Sauvegarder mon journal', () => {
  it('lie l’e-mail à la session anonyme avec le code reçu', async () => {
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText('Code envoyé à mattia@exemple.fr')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText("C'est sauvegardé.")).toBeTruthy();
    expect(mockAuth.etat).toMatchObject({ email: 'mattia@exemple.fr', anonyme: false });
    expect(mockRestaurer).not.toHaveBeenCalled();
  });

  it('crée d’abord une session si le téléphone n’en a pas (démarré hors ligne)', async () => {
    mockAuth.etat = null;
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText('Code envoyé à mattia@exemple.fr')).toBeTruthy();
    expect(mockAuth.etat).toMatchObject({ anonyme: true });
  });

  it('retrouve le journal d’un compte existant', async () => {
    mockAuth.comptes.set('mattia@exemple.fr', 'compte-1');
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText('Ton journal est de retour.')).toBeTruthy();
    expect(mockRestaurer).toHaveBeenCalledTimes(1);
  });

  it('programme la restauration avant de vérifier le code d’un compte existant', async () => {
    mockAuth.comptes.set('mattia@exemple.fr', 'compte-1');
    const ordre: string[] = [];
    mockProgrammer.mockImplementationOnce(async () => {
      ordre.push('programmer');
    });
    const confirmer = jest.spyOn(mockAuth, 'confirmerCode');
    confirmer.mockImplementationOnce(async () => {
      ordre.push('confirmer');
      throw new ErreurCompte('code-invalide');
    });
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    await screen.findByText('Ce code ne marche pas. Vérifie-le ou demande-en un autre.');
    expect(ordre).toEqual(['programmer', 'confirmer']);
    expect(mockRestaurer).not.toHaveBeenCalled();
    confirmer.mockRestore();
  });

  it('ne programme pas de restauration pour une simple liaison', async () => {
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    await screen.findByText("C'est sauvegardé.");
    expect(mockProgrammer).not.toHaveBeenCalled();
  });

  it('dit « C’est sauvegardé. » quand la restauration échoue après une connexion réussie', async () => {
    mockAuth.comptes.set('mattia@exemple.fr', 'compte-1');
    mockRestaurer.mockResolvedValueOnce(false);
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText("C'est sauvegardé.")).toBeTruthy();
  });

  it('refuse une adresse mal formée sans rien envoyer', async () => {
    const demanderCode = jest.spyOn(mockAuth, 'demanderCode');
    await saisirEmail('mattia@exemple');
    expect(screen.getByText('Vérifie ton adresse e-mail.')).toBeTruthy();
    expect(demanderCode).not.toHaveBeenCalled();
    demanderCode.mockRestore();
  });

  it('explique un code faux sans quitter l’étape', async () => {
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '000000');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(await screen.findByText('Ce code ne marche pas. Vérifie-le ou demande-en un autre.')).toBeTruthy();
    expect(screen.getByLabelText('Code à 6 chiffres')).toBeTruthy();
  });

  it('explique l’absence de réseau', async () => {
    mockAuth.enPanne = true;
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText("Pas de connexion pour l'instant. Réessaie dans un moment.")).toBeTruthy();
  });

  it('explique qu’il y a eu trop d’essais', async () => {
    const demanderCode = jest.spyOn(mockAuth, 'demanderCode').mockRejectedValueOnce(new ErreurCompte('trop-de-tentatives'));
    await saisirEmail('mattia@exemple.fr');
    expect(await screen.findByText("Trop d'essais d'un coup. Réessaie dans quelques minutes.")).toBeTruthy();
    demanderCode.mockRestore();
  });

  it('bloque « Renvoyer le code » pendant 60 secondes', async () => {
    jest.useFakeTimers();
    try {
      await saisirEmail('mattia@exemple.fr');
      const renvoyer = await screen.findByRole('button', { name: 'Renvoyer le code' });
      expect(renvoyer).toBeDisabled();
      await act(async () => {
        jest.advanceTimersByTime(60000);
      });
      expect(screen.getByRole('button', { name: 'Renvoyer le code' })).toBeEnabled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('permet de changer d’e-mail', async () => {
    await saisirEmail('mattia@exemple.fr');
    await fireEvent.press(await screen.findByRole('button', { name: "Changer d'e-mail" }));
    expect(screen.getByLabelText('Adresse e-mail')).toBeTruthy();
  });

  it('revient au journal à la fin', async () => {
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    await fireEvent.press(await screen.findByRole('button', { name: 'Sauvegarder mon journal' }));
    expect(screen).toHavePathname('/sauvegarde');
    await fireEvent.changeText(screen.getByLabelText('Adresse e-mail'), 'mattia@exemple.fr');
    await fireEvent.press(screen.getByRole('button', { name: 'Recevoir mon code' }));
    await fireEvent.changeText(await screen.findByLabelText('Code à 6 chiffres'), '123456');
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Retour au journal' }));
    await waitFor(() => expect(screen).toHavePathname('/journal'));
    expect(await screen.findByText('Journal sauvegardé · mattia@exemple.fr')).toBeTruthy();
  });

  it('ne propose plus la sauvegarde une fois le compte lié', async () => {
    mockAuth.etat = { utilisateurId: 'u1', email: 'mattia@exemple.fr', anonyme: false };
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Journal sauvegardé · mattia@exemple.fr')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
  });

  it('n’affiche rien dans le pied du journal tant que la session n’est pas lue', async () => {
    mockAuth.etat = { utilisateurId: 'u1', email: 'mattia@exemple.fr', anonyme: false };
    let lire!: () => void;
    const attente = new Promise<void>((resolve) => {
      lire = resolve;
    });
    const session = jest.spyOn(mockAuth, 'sessionCourante').mockImplementationOnce(async () => {
      await attente;
      return mockAuth.etat;
    });
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByText('Ta première séance apparaîtra ici.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
    await act(async () => {
      lire();
    });
    expect(await screen.findByText('Journal sauvegardé · mattia@exemple.fr')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sauvegarder mon journal' })).toBeNull();
    session.mockRestore();
  });

  it('propose la sauvegarde quand la session ne se lit pas', async () => {
    const session = jest.spyOn(mockAuth, 'sessionCourante').mockRejectedValueOnce(new ErreurCompte('reseau'));
    await renderRouter(ROUTES, { initialUrl: '/journal' });
    expect(await screen.findByRole('button', { name: 'Sauvegarder mon journal' })).toBeTruthy();
    session.mockRestore();
  });
});
