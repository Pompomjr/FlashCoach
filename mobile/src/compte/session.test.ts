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
});
