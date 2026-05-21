import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Body, H2 } from '@/design-system';

export default function ScanEntryScreen() {
  return (
    <View style={styles.screen}>
      <H2>Scan</H2>
      <Body>Open queue and choose a job to start NFC + QA flow.</Body>
      <Pressable style={styles.button} onPress={() => router.push('/(printer)/queue')}>
        <Body style={styles.buttonText}>Go to Queue</Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  button: { height: 44, borderRadius: 12, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
