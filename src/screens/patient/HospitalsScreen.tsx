import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';

// Mock Data
const HOSPITALS = [
  { id: '1', name: 'General City Hospital', address: '100 Main St, NY', type: 'Public', distance: '1.5 km', emergency: true },
  { id: '2', name: 'Valley Medical Center', address: '200 Valley Rd, NY', type: 'Private', distance: '3.2 km', emergency: false },
  { id: '3', name: 'St. Jude Health', address: '350 Saint Pl, NY', type: 'Private', distance: '4.8 km', emergency: true },
];

export default function HospitalsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospitals</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={HOSPITALS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBg}>
                <Ionicons name="business" size={24} color={Colors.primary[600]} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.badges}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.type}</Text>
                </View>
                {item.emergency && (
                  <View style={[styles.badge, styles.emergencyBadge]}>
                    <Text style={[styles.badgeText, styles.emergencyText]}>ER Available</Text>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                <Text style={styles.distance}>{item.distance}</Text>
                <TouchableOpacity style={styles.navBtn}>
                  <Ionicons name="navigate" size={16} color={Colors.text.inverse} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hospitals found nearby.</Text>
          </View>
        }
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
    paddingVertical: Spacing[4],
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  listContent: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  address: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.neutral[100],
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  emergencyBadge: {
    backgroundColor: '#FEE2E2',
  },
  emergencyText: {
    color: '#EF4444',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  distance: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.text.secondary,
  },
});
