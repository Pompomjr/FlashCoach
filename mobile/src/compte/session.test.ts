import { AuthMemoire } from './authMemoire';
import { assurerSession } from './session';

describe('assurerSession', () => {
  it('reprend la session existante sans en créer', async () => {
    const auth = new AuthMemoire();
    auth.etat = { utilisateurId: 'u1', email: null, anonyme: true };
    expect(await assurerSession(auth)).toEqual(auth.etat);
    expect(auth.creations).toBe(0);
  });

  it('crée une session anonyme au premier lancement', async () => {
    const auth = new AuthMemoire();
    expect(await assurerSession(auth)).toMatchObject({ anonyme: true });
    expect(auth.creations).toBe(1);
  });

  it('renvoie null sans rejeter quand le réseau manque', async () => {
    const auth = new AuthMemoire();
    auth.enPanne = true;
    await expect(assurerSession(auth)).resolves.toBeNull();
  });

  it('ne crée qu’une session quand deux appels se croisent', async () => {
    const auth = new AuthMemoire();
    const [a, b] = await Promise.all([assurerSession(auth), assurerSession(auth)]);
    expect(auth.creations).toBe(1);
    expect(a).toEqual(b);
    expect(await assurerSession(auth)).toEqual(a);
    expect(auth.creations).toBe(1);
  });

  it('retente normalement après un essai terminé en échec', async () => {
    const auth = new AuthMemoire();
    auth.enPanne = true;
    expect(await assurerSession(auth)).toBeNull();
    auth.enPanne = false;
    expect(await assurerSession(auth)).toMatchObject({ anonyme: true });
    expect(auth.creations).toBe(1);
  });
});
