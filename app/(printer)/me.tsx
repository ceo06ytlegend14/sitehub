import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Body, H2 } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';

export default function PrinterMeScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={styles.screen}>
      <H2>{user?.name}</H2>
      <Body>{user?.email}</Body>
      <Pressable style={styles.button} onPress={logout}><Body style={styles.buttonText}>Logout</Body></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  button: { height: 44, borderRadius: 12, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
