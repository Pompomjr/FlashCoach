import { render, screen } from '@testing-library/react-native';

import { CONTEXTES } from '../../catalogue/contextes';
import { RESSENTIS } from '../../catalogue/types';
import { ICONE_APRES, ICONE_CONTEXTE, ICONE_RESSENTI, Icone, NOMS_ICONES, type NomIcone } from './index';
import { TRACES } from './traces';

describe('Icone', () => {
  it.each(NOMS_ICONES)('rend l’icône « %s » sans erreur', async (nom) => {
    await render(<Icone nom={nom} />);
    expect(screen.getByTestId(`icone-${nom}`, { includeHiddenElements: true })).toBeTruthy();
  });

  it('propose au moins les icônes du brief', () => {
    const attendues: NomIcone[] = [
      'reveil', 'maison', 'bureau', 'voyage', 'dehors', 'raide', 'stresse', 'mou', 'en_forme',
      'cadenas', 'retour', 'journal', 'mieux', 'pareil',
    ];
    for (const nom of attendues) expect(NOMS_ICONES).toContain(nom);
  });

  it('dessine l’icône « circuit » : deux flèches en boucle', () => {
    expect(NOMS_ICONES).toContain('circuit');
    expect(TRACES.circuit).toEqual(['M4 12a8 8 0 0 1 13.7-5.6', 'M18 3v4h-4', 'M20 12a8 8 0 0 1-13.7 5.6', 'M6 21v-4h4']);
  });

  it('est décorative : cachée aux lecteurs d’écran', async () => {
    await render(<Icone nom="maison" />);
    expect(screen.queryByTestId('icone-maison')).toBeNull();
    expect(screen.getByTestId('icone-maison', { includeHiddenElements: true })).toBeTruthy();
  });

  it('prend la taille demandée (24 par défaut)', async () => {
    await render(
      <>
        <Icone nom="maison" />
        <Icone nom="bureau" taille={40} />
      </>,
    );
    const defaut = screen.getByTestId('icone-maison', { includeHiddenElements: true });
    const grande = screen.getByTestId('icone-bureau', { includeHiddenElements: true });
    expect(defaut).toHaveStyle({ width: 24, height: 24 });
    expect(grande).toHaveStyle({ width: 40, height: 40 });
  });
});

describe('tables d’icônes', () => {
  it('associent une icône connue à chaque contexte du catalogue', () => {
    for (const contexte of CONTEXTES) expect(NOMS_ICONES).toContain(ICONE_CONTEXTE[contexte.id]);
  });

  it('associent une icône connue à chaque ressenti et à chaque réponse « après »', () => {
    for (const ressenti of RESSENTIS) expect(NOMS_ICONES).toContain(ICONE_RESSENTI[ressenti]);
    expect(ICONE_APRES.mieux).toBe('mieux');
    expect(ICONE_APRES.pareil).toBe('pareil');
  });
});
