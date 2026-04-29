/**
 * Avatar Selection Screen
 * Based on shared/avatar/selection.ts — 8 avatar options
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './lib/constants';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = (width - 64) / 2;

const AVATARS = [
  { id: 'peacock_elegant', name: 'Peacock Elegant', description: 'Iridescent grace and refined beauty', colors: ['#00A896', '#6A5ACD'], icon: '🦚' },
  { id: 'peacock_creative', name: 'Peacock Creative', description: 'Artistic expression and vibrant energy', colors: ['#9370DB', '#4B0082'], icon: '🎨' },
  { id: 'peacock_compassionate', name: 'Peacock Compassionate', description: 'Empathetic warmth and gentle wisdom', colors: ['#00A896', '#2D5A4A'], icon: '💜' },
  { id: 'leopard_strategic', name: 'Leopard Strategic', description: 'Sharp focus and powerful execution', colors: ['#C69C6D', '#8A6240'], icon: '🐆' },
  { id: 'leopard_fierce', name: 'Leopard Fierce', description: 'Bold protection and fierce loyalty', colors: ['#FF8C00', '#FFD700'], icon: '🔥' },
  { id: 'celestial_mystic', name: 'Celestial Mystic', description: 'Cosmic awareness and spiritual depth', colors: ['#9D8DF1', '#4B3F72'], icon: '✨' },
  { id: 'obsidian_guardian', name: 'Obsidian Guardian', description: 'Unwavering protection and silent strength', colors: ['#1a1a1a', '#EAEAEA'], icon: '🛡️' },
  { id: 'void_transcendent', name: 'Void Transcendent', description: 'Beyond limitations, pure consciousness', colors: ['#050505', '#FFD700'], icon: '🌌' },
];

export default function AvatarScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  const handleConfirm = () => {
    if (selected) {
      // Save avatar choice and navigate back
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Sallie's Avatar</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>Select the visual identity that resonates with your vision of Sallie</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        {AVATARS.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarCard,
              selected === avatar.id && styles.selectedCard,
              { borderColor: selected === avatar.id ? avatar.colors[0] : 'rgba(139,92,246,0.2)' },
            ]}
            onPress={() => handleSelect(avatar.id)}
          >
            <View style={[styles.avatarPreview, { backgroundColor: avatar.colors[0] + '30' }]}>
              <Text style={styles.avatarIcon}>{avatar.icon}</Text>
            </View>
            <Text style={styles.avatarName}>{avatar.name}</Text>
            <Text style={styles.avatarDesc}>{avatar.description}</Text>
            {selected === avatar.id && (
              <View style={[styles.checkmark, { backgroundColor: avatar.colors[0] }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 32, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, paddingBottom: 100 },
  avatarCard: { width: AVATAR_SIZE, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 16, padding: 16, position: 'relative' },
  selectedCard: { backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 2 },
  avatarPreview: { width: '100%', aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarIcon: { fontSize: 48 },
  avatarName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  avatarDesc: { fontSize: 11, color: '#999', lineHeight: 16 },
  checkmark: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 34, backgroundColor: COLORS.bgDark, borderTopWidth: 1, borderTopColor: 'rgba(139,92,246,0.1)' },
  confirmButton: { backgroundColor: COLORS.purpleLight, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
