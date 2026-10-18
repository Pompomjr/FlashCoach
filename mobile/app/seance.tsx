import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXERCICES } from '../src/catalogue/exercices';
import { genererSeance } from '../src/generateur/generer';
import type { ParametresSeance } from '../src/generateur/types';
import { ecrireDerniersExercices } from '../src/preferences/preferences';
import { stockageTelephone } from '../src/preferences/stockage';
import { coteCourant, formaterTemps, minutesEffectuees } from '../src/seance/affichage';
import { lireParametresSeance } from '../src/seance/parametres';
import { useLecteurSeance } from '../src/seance/useLecteurSeance';
import { Bouton } from '../src/ui/Bouton';
import { LIBELLES_PHASE } from '../src/ui/libelles';
import { COULEURS, ESPACE, RAYON } from '../src/ui/theme';

export default function EcranSeance() {
  const { contexte, ressenti, duree, graine, exclure } = useLocalSearchParams<{
    contexte: string;
    ressenti: string;
    duree: string;
    graine: string;
    exclure: string;
  }>();
  const parametres = useMemo(
    () => lireParametresSeance({ contexte, ressenti, duree, graine, exclure }),
    [contexte, ressenti, duree, graine, exclure],
  );
  if (parametres === null) return <Redirect href="/" />;
  return <LecteurSeance parametres={parametres} />;
}

function LecteurSeance({ parametres }: { parametres: ParametresSeance }) {
  useKeepAwake();
  const seance = useMemo(() => genererSeance(parametres, EXERCICES), [parametres]);
  const { etat, passer, basculerPause, terminer } = useLecteurSeance(seance.blocs);
  const bloc = etat.blocs[etat.index];
  const cote = coteCourant(etat);

  // Les exercices de cette séance seront évités la prochaine fois.
  useEffect(() => {
    ecrireDerniersExercices(stockageTelephone, seance.blocs.map((b) => b.exercice.id)).catch(() => undefined);
  }, [seance]);

  // Une vibration à chaque changement d'étape, pas au démarrage.
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, [etat.index, etat.etape]);

  useEffect(() => {
    if (!etat.termine) return;
    router.replace({
      pathname: '/bravo',
      params: { minutes: String(minutesEffectuees(etat.ecouleMs)), exercices: String(etat.exercicesFaits) },
    });
  }, [etat.termine, etat.ecouleMs, etat.exercicesFaits]);

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quitter la séance" onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.retour}>‹</Text>
        </Pressable>
        <Text style={styles.compteur}>{`${etat.index + 1} / ${etat.blocs.length}`}</Text>
      </View>

      <View style={styles.carte}>
        <Text style={styles.phase}>{etat.etape === 'transition' ? 'À suivre' : LIBELLES_PHASE[bloc.phase]}</Text>
        <Text style={styles.nom}>{bloc.exercice.nom}</Text>
        {cote !== null && <Text style={styles.cote}>{cote === 'gauche' ? 'Côté gauche' : 'Côté droit'}</Text>}
        <Text style={styles.consigne}>{bloc.exercice.consigne}</Text>
      </View>

      <Text style={styles.minuteur} accessibilityRole="timer">
        {formaterTemps(etat.restantMs)}
      </Text>
      {etat.enPause && <Text style={styles.pause}>En pause</Text>}

      <View style={styles.actions}>
        <Bouton libelle={etat.enPause ? 'Reprendre' : 'Pause'} variante="secondaire" onPress={basculerPause} />
        <View style={styles.ligne}>
          <Bouton libelle="Passer" onPress={passer} />
          <Bouton libelle="Terminer la séance" variante="secondaire" onPress={terminer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond, padding: ESPACE, gap: 16 },
  entete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  retour: { color: COULEURS.texte, fontSize: 32, paddingHorizontal: 8 },
  compteur: { color: COULEURS.texte, fontSize: 18, fontWeight: '600' },
  carte: { backgroundColor: COULEURS.carteClaire, borderRadius: RAYON, padding: 24, gap: 8, minHeight: 220, justifyContent: 'center' },
  phase: { color: COULEURS.texteSombre, fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  nom: { color: COULEURS.texteSombre, fontSize: 28, fontWeight: '800' },
  cote: { color: COULEURS.texteSombre, fontSize: 18, fontWeight: '700' },
  consigne: { color: COULEURS.texteSombre, fontSize: 16, lineHeight: 22 },
  minuteur: { color: COULEURS.texte, fontSize: 64, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  pause: { color: COULEURS.texteDiscret, fontSize: 16, textAlign: 'center' },
  actions: { marginTop: 'auto', gap: 12 },
  ligne: { flexDirection: 'row', gap: 12 },
});
