import { StyleSheet, Text, View } from 'react-native';

export default function Accueil() {
  return (
    <View style={styles.conteneur}>
      <Text style={styles.titre}>Flash Coach</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2F7' },
  titre: { fontSize: 32, fontWeight: '700', color: '#3A506B' },
});
