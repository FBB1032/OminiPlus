import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../../theme';
import { Button } from '../../../components';
import { useAuthStore } from '../../../store/authStore';

export default function PendingApprovalScreen({ navigation }: any) {
  const handleBypassApprove = async () => {
    // Simulated approval: log in as doctor directly for sandbox demonstration
    const mockDoctorUser = {
      id: 'mock-doctor-123',
      email: 'doctor@ominipulse.ai',
      firstName: 'Babajide',
      lastName: 'Alabi',
      role: 'doctor' as const,
      phone: '+234 803 555 1234',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
      createdAt: new Date().toISOString(),
    };
    const mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600 * 1000,
    };
    await useAuthStore.getState().setAuth(mockDoctorUser, mockTokens);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconGlow} />
          <View style={styles.iconBg}>
            <Ionicons name="time-outline" size={48} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Verification Pending</Text>
        
        <Text style={styles.description}>
          Thank you for joining Omini Pulse as a clinical practitioner. Our verification committee is currently reviewing your medical license and hospital affiliations.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.cardText}>Email registered successfully</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.cardText}>Medical credentials uploaded</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="ellipse-outline" size={20} color="#F59E0B" />
            <Text style={[styles.cardText, { color: '#D97706' }]}>License verification: Pending</Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          This verification process typically takes 24–48 hours. You will receive an email once your clinical account is activated.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            label="Back to Sign In"
            onPress={() => navigation.navigate('Login')}
            style={styles.btn}
          />
          
          <Button
            variant="primary"
            label="Auto-Approve License (Demo)"
            onPress={handleBypassApprove}
            style={styles.bypassBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFA',
  },
  container: {
    flexGrow: 1,
    padding: Spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[6],
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: '#0F172A',
    marginBottom: Spacing[3],
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.sm,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing[6],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing[5],
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    ...Shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  cardText: {
    fontSize: FontSize.sm,
    color: '#1E293B',
    fontWeight: FontWeight.medium,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing[8],
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing[3],
  },
  btn: {
    width: '100%',
  },
  bypassBtn: {
    width: '100%',
    backgroundColor: '#10B981',
  },
});
