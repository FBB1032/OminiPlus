import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button } from '../../components';

export default function PremiumScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>OminiPulse Free Access</Text>
          <Text style={styles.headerSubtitle}>Pay-per-Consultation Model</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.iconBadge}>
            <Ionicons name="gift-outline" size={28} color="#059669" />
          </View>
          <Text style={styles.heroTitle}>No Monthly Subscription Required</Text>
          <Text style={styles.heroSub}>
            OminiPulse is 100% free to join and browse. You only pay for individual consultations when you book a doctor, with zero recurring charges or hidden fees.
          </Text>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Free registration & unlimited health record storage</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Free AI Symptom Checker & AI Health Assistant</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Pay standard fee only when booking a doctor consultation</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Escrow protection holds payment until doctor approves</Text>
          </View>
        </Card>

        <Button
          label="Browse Doctors & Book Consultation"
          onPress={() => navigation.navigate('PatientTabs')}
          variant="primary"
        />
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
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  scrollContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  heroCard: {
    padding: Spacing[5],
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    gap: 8,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#065F46',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 12.5,
    color: Colors.text.primary,
    flex: 1,
  },
});
