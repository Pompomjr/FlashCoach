// Usage : npm run couverture
// Liste les combinaisons contexte + ressenti qui manquent d'exercices : c'est la liste de contenu à produire.
// Puis, pour les niveaux 2 et 3, les combinaisons dont le cœur est en partie rabattu sur un niveau inférieur.
import { CONTEXTES } from '../src/catalogue/contextes';
import { EXERCICES } from '../src/catalogue/exercices';
import { analyserCouverture, analyserRabattements, formaterRabattements, formaterRapport } from '../src/generateur/couverture';

console.log(formaterRapport(analyserCouverture(EXERCICES, CONTEXTES)));

for (const niveau of [2, 3] as const) {
  console.log('');
  console.log(formaterRabattements(analyserRabattements(EXERCICES, CONTEXTES, niveau), niveau));
}
