import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button } from '../../components';
import { useConsentStore } from '../../store/consentStore';
import { ConsentGrant } from '../../types/consent';
import { ConsentModal } from '../../components/consent/ConsentModal';

export default function ConsentManagementScreen({ navigation }: any) {
  const { grants, loadGrants, revokeConsent, grantConsent } = useConsentStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newScope, setNewScope] = useState<'medical_history' | 'lab_report' | 'ai_analysis'>('medical_history');
  const [targetDoctor, setTargetDoctor] = useState('Dr. Ahmed Musa');

  useEffect(() => {
    loadGrants();
  }, []);

  const handleRevoke = (grant: ConsentGrant) => {
    Alert.alert(
      'Revoke Consent',
      `Are you sure you want to revoke consent for "${grant.title}"? Healthcare providers or AI systems will no longer be authorized to access this data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => revokeConsent(grant.id),
        },
      ]
    );
  };

  const handleToggle = (grant: ConsentGrant) => {
    if (grant.status === 'granted') {
      handleRevoke(grant);
    } else {
      grantConsent(grant.scope, grant.targetName, grant.targetId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Consent Management</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={grants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.bannerCard}>
            <View style={styles.shieldCircle}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary[600]} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.bannerTitle}>Patient Data Protection & Consent</Text>
              <Text style={styles.bannerText}>
                You retain complete control over your health records. Healthcare providers and AI tools must receive your explicit authorization before accessing records.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isGranted = item.status === 'granted';
          return (
            <Card style={styles.grantCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.badgeIcon, { backgroundColor: isGranted ? '#ECFDF5' : '#F1F5F9' }]}>
                    <Ionicons
                      name={item.scope === 'ai_analysis' ? 'hardware-chip-outline' : 'document-text-outline'}
                      size={20}
                      color={isGranted ? '#059669' : Colors.neutral[500]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.grantTitle}>{item.title}</Text>
                    <Text style={styles.targetName}>Authorized: {item.targetName}</Text>
                  </View>
                </View>
                <Switch
                  value={isGranted}
                  onValueChange={() => handleToggle(item)}
                  trackColor={{ false: Colors.neutral[300], true: Colors.secondary[600] }}
                  thumbColor={Colors.surface}
                />
              </View>

              <Text style={styles.grantDesc}>{item.description}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, { backgroundColor: isGranted ? '#10B981' : '#94A3B8' }]} />
                  <Text style={[styles.statusText, { color: isGranted ? '#065F46' : Colors.neutral[600] }]}>
                    {isGranted ? 'Active Access Granted' : 'Access Revoked'}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {isGranted
                    ? `Granted: ${new Date(item.grantedAt).toLocaleDateString()}`
                    : `Revoked: ${new Date(item.revokedAt || Date.now()).toLocaleDateString()}`}
                </Text>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="lock-open-outline" size={44} color={Colors.neutral[400]} />
            <Text style={styles.emptyTitle}>No Active Consents</Text>
            <Text style={styles.emptyText}>You have not granted medical history access to any provider.</Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <Button
          label="Grant New Authorization"
          leftIcon={<Ionicons name="add-circle-outline" size={20} color={Colors.text.inverse} />}
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ConsentModal
        visible={modalVisible}
        scope={newScope}
        targetName={targetDoctor}
        onAgree={() => {
          grantConsent(newScope, targetDoctor);
          setModalVisible(false);
          Alert.alert('Consent Granted', `Explicit consent has been granted for ${targetDoctor}.`);
        }}
        onDecline={() => setModalVisible(false)}
      />
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
  backBtn: {
    padding: Spacing[1],
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  container: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  shieldCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[900],
  },
  bannerText: {
    fontSize: FontSize.xs,
    color: Colors.primary[800],
    lineHeight: 18,
  },
  grantCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grantTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  targetName: {
    fontSize: FontSize.xs,
    color: Colors.secondary[600],
    fontWeight: FontWeight.medium,
  },
  grantDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    lineHeight: 18,
    backgroundColor: Colors.background,
    padding: Spacing[3],
    borderRadius: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[2],
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  dateText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
    gap: Spacing[2],
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bottomBar: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
