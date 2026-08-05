import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components';

import { authService } from '../../services/authService';

export default function SuspendedAccountScreen() {
  const { user } = useAuth();

  const handleLogout = () => {
    authService.logout();
  };

  const handleContactCompliance = () => {
    Linking.openURL('mailto:compliance@ominipulse.ng?subject=Doctor%20Account%20Suspension%20Appeal');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Suspended</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.warningCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="ban-outline" size={32} color="#DC2626" />
          </View>
          
          <Text style={styles.title}>Practitioner Access Restricted</Text>
          <Text style={styles.subtitle}>
            Your practitioner account on OminiPulse has been indefinitely suspended by Compliance Officers.
          </Text>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>SUSPENSION REASON / COMPLIANCE NOTE</Text>
            <Text style={styles.reasonText}>
              {(user as any)?.suspensionReason || 'Account suspended pending credential or appointment conduct investigation.'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#2563EB" style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>
              During suspension, all patient booking, prescription issuing, and medical record access functions are disabled. Your past completed consultation records remain locked in read-only audit mode.
            </Text>
          </View>
        </Card>

        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>Filing an Appeal</Text>
          <Text style={styles.actionDesc}>
            If you believe this suspension was issued in error or wish to submit updated MDCN license credentials, you may contact our Compliance Committee directly.
          </Text>

          <TouchableOpacity style={styles.contactBtn} onPress={handleContactCompliance} activeOpacity={0.8}>
            <Ionicons name="mail" size={18} color="#FFFFFF" />
            <Text style={styles.contactBtnText}>Contact Compliance Officer (compliance@ominipulse.ng)</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  warningCard: {
    alignItems: 'center',
    padding: Spacing[5],
    borderColor: '#FCA5A5',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
    gap: Spacing[3],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 18,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: Spacing[3],
    gap: 4,
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: FontSize.xs,
    color: '#1E293B',
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: Spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
  actionCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  actionDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  contactBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
