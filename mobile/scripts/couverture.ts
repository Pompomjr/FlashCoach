// Usage : npm run couverture
// Liste les combinaisons contexte + ressenti qui manquent d'exercices : c'est la liste de contenu à produire.
import { CONTEXTES } from '../src/catalogue/contextes';
import { EXERCICES } from '../src/catalogue/exercices';
import { analyserCouverture, formaterRapport } from '../src/generateur/couverture';

console.log(formaterRapport(analyserCouverture(EXERCICES, CONTEXTES)));
