import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErreurCompte, type ModeCode } from '../src/compte/auth';
import { DELAI_RENVOI_MS, MESSAGE_EMAIL_INVALIDE, codeValide, emailValide, messageErreur } from '../src/compte/liaison';
import { assurerSession } from '../src/compte/session';
import { authApp, moteurApp } from '../src/synchro/instance';
import { Bouton } from '../src/ui/Bouton';
import { Icone } from '../src/ui/icones';
import { CIBLE_MIN, COULEURS, ELEVATION, ESPACE, RAYON, TYPO } from '../src/ui/theme';
import { ondulation } from '../src/ui/toucher';

type Etape = { nom: 'email' } | { nom: 'code'; mode: ModeCode } | { nom: 'fin'; restaure: boolean };

export default function Sauvegarde() {
  const [etape, setEtape] = useState<Etape>({ nom: 'email' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const [renvoiPossible, setRenvoiPossible] = useState(false);
  const enVol = useRef(false);

  // « Renvoyer le code » reste inactif 60 s après chaque envoi.
  useEffect(() => {
    if (etape.nom !== 'code' || renvoiPossible) return;
    const minuteur = setTimeout(() => setRenvoiPossible(true), DELAI_RENVOI_MS);
    return () => clearTimeout(minuteur);
  }, [etape, renvoiPossible]);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/journal'));

  // Un seul appel à la fois : un double tap ne renvoie pas deux codes.
  const executer = async (action: () => Promise<void>) => {
    if (enVol.current || authApp === null) return;
    enVol.current = true;
    setOccupe(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      enVol.current = false;
      setOccupe(false);
    }
  };

  const recevoirCode = () => {
    const adresse = email.trim();
    if (!emailValide(adresse)) {
      setErreur(MESSAGE_EMAIL_INVALIDE);
      return;
    }
    executer(async () => {
      // Démarré hors ligne, le téléphone n'a pas encore de session : on en crée une avant de demander le code.
      const session = await assurerSession(authApp!);
      if (session === null) throw new ErreurCompte('reseau');
      const mode = await authApp!.demanderCode(adresse);
      setEmail(adresse);
      setCode('');
      setRenvoiPossible(false);
      setEtape({ nom: 'code', mode });
    });
  };

  const valider = () => {
    if (etape.nom !== 'code' || !codeValide(code)) return;
    executer(async () => {
      // Drapeau posé avant la vérification : une fermeture entre le code et la restauration ne perd rien.
      if (etape.mode === 'connexion') await moteurApp?.programmerRestauration();
      await authApp!.confirmerCode(email, code, etape.mode);
      const restaure = etape.mode === 'connexion' && moteurApp !== null && (await moteurApp.restaurerApresConnexion());
      if (etape.mode === 'liaison') moteurApp?.demanderSynchro().catch(() => undefined);
      setEtape({ nom: 'fin', restaure });
    });
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <View style={styles.entete}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={retour} android_ripple={ondulation(COULEURS.texte)} style={styles.retour}>
          <Icone nom="retour" taille={28} />
        </Pressable>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
          {etape.nom === 'email' && (
            <>
              <Text style={styles.titre} accessibilityRole="header">Garde ton journal en sécurité</Text>
              <Text style={styles.texte}>{"On t'envoie un code pour le retrouver sur n'importe quel téléphone."}</Text>
              <TextInput
                accessibilityLabel="Adresse e-mail"
                value={email}
                onChangeText={(texte) => {
                  setEmail(texte);
                  setErreur(null);
                }}
                onSubmitEditing={recevoirCode}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="ton@email.fr"
                placeholderTextColor={COULEURS.texteDiscret}
                style={styles.champ}
              />
              {erreur !== null && <Text style={styles.erreur} accessibilityLiveRegion="polite">{erreur}</Text>}
              <Action libelle="Recevoir mon code" occupe={occupe} inactif={email.trim() === ''} onPress={recevoirCode} />
            </>
          )}

          {etape.nom === 'code' && (
            <>
              <Text style={styles.titre} accessibilityRole="header">{`Code envoyé à ${email}`}</Text>
              <TextInput
                accessibilityLabel="Code à 6 chiffres"
                value={code}
                onChangeText={(texte) => {
                  setCode(texte.replace(/\D/g, '').slice(0, 6));
                  setErreur(null);
                }}
                onSubmitEditing={valider}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                style={[styles.champ, styles.champCode]}
              />
              {erreur !== null && <Text style={styles.erreur} accessibilityLiveRegion="polite">{erreur}</Text>}
              <Action libelle="Valider" occupe={occupe} inactif={!codeValide(code)} onPress={valider} />
              <View style={styles.liens}>
                <Lien libelle="Renvoyer le code" inactif={!renvoiPossible || occupe} onPress={recevoirCode} />
                <Lien
                  libelle="Changer d'e-mail"
                  inactif={occupe}
                  onPress={() => {
                    setErreur(null);
                    setEtape({ nom: 'email' });
                  }}
                />
              </View>
            </>
          )}

          {etape.nom === 'fin' && (
            <View style={styles.fin}>
              <View style={styles.coche} aria-hidden>
                <Icone nom="mieux" taille={40} couleur={COULEURS.texteSurOrange} />
              </View>
              <Text style={styles.titre} accessibilityRole="header" accessibilityLiveRegion="polite">
                {etape.restaure ? 'Ton journal est de retour.' : "C'est sauvegardé."}
              </Text>
              <Bouton libelle="Retour au journal" onPress={retour} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Action({ libelle, occupe, inactif, onPress }: { libelle: string; occupe: boolean; inactif: boolean; onPress: () => void }) {
  const desactive = occupe || inactif;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: desactive, busy: occupe }}
      disabled={desactive}
      onPress={onPress}
      android_ripple={ondulation(COULEURS.texteSurOrange)}
      style={[styles.action, desactive && styles.actionInactive]}
    >
      {occupe ? <ActivityIndicator color={COULEURS.texteSurOrange} /> : <Text style={styles.texteAction}>{libelle}</Text>}
    </Pressable>
  );
}

function Lien({ libelle, inactif, onPress }: { libelle: string; inactif: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityState={{ disabled: inactif }}
      disabled={inactif}
      onPress={onPress}
      android_ripple={ondulation(COULEURS.texte)}
      style={styles.lien}
    >
      <Text style={[styles.texteLien, inactif && styles.texteLienInactif]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COULEURS.fond },
  flex: { flex: 1 },
  entete: { padding: ESPACE },
  retour: { width: CIBLE_MIN, height: CIBLE_MIN, borderRadius: CIBLE_MIN / 2, alignItems: 'center', justifyContent: 'center' },
  contenu: { paddingHorizontal: ESPACE, paddingBottom: ESPACE * 2, gap: 16 },
  titre: { ...TYPO.headlineMedium, color: COULEURS.texte },
  texte: { ...TYPO.bodyLarge, color: COULEURS.texteDiscret },
  champ: {
    ...TYPO.bodyLarge,
    minHeight: CIBLE_MIN + 8,
    borderRadius: RAYON,
    paddingHorizontal: ESPACE,
    backgroundColor: COULEURS.carte,
    color: COULEURS.texte,
    ...ELEVATION.niveau1,
  },
  champCode: { ...TYPO.headlineMedium, letterSpacing: 8, textAlign: 'center' },
  erreur: { ...TYPO.bodyMedium, color: COULEURS.texte },
  action: { minHeight: CIBLE_MIN, borderRadius: RAYON, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  actionInactive: { opacity: 0.5 },
  texteAction: { ...TYPO.titleMedium, color: COULEURS.texteSurOrange },
  liens: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  lien: { minHeight: CIBLE_MIN, justifyContent: 'center', paddingHorizontal: 4 },
  texteLien: { ...TYPO.labelLarge, color: COULEURS.texte, textDecorationLine: 'underline' },
  texteLienInactif: { color: COULEURS.texteDiscret, textDecorationLine: 'none' },
  fin: { alignItems: 'center', gap: 20, marginTop: 40 },
  coche: { width: 72, height: 72, borderRadius: 36, backgroundColor: COULEURS.orange, alignItems: 'center', justifyContent: 'center' },
});
