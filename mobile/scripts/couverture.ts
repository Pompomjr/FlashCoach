// Usage : npm run couverture
// Pour chaque intensité (Léger, Moyen, Lourd), liste les combinaisons objectif + durée qui manquent d'exercices :
// c'est la liste de contenu à produire. Puis, pour Moyen et Lourd, les durées dont le cœur « calories » est en
// partie rabattu sur un niveau inférieur. La prise de masse joue les circuits : elle n'est pas analysée ici.
import { EXERCICES } from '../src/catalogue/exercices';
import { NIVEAUX, NOMS_NIVEAU } from '../src/catalogue/types';
import { analyserCouverture, analyserRabattements, formaterRabattements, formaterRapport } from '../src/generateur/couverture';

for (const niveau of NIVEAUX) {
  if (niveau > 1) console.log('');
  console.log(`Intensité ${NOMS_NIVEAU[niveau]}`);
  console.log(formaterRapport(analyserCouverture(EXERCICES, niveau)));
}

for (const niveau of [2, 3] as const) {
  console.log('');
  console.log(formaterRabattements(analyserRabattements(EXERCICES, niveau), niveau));
}
