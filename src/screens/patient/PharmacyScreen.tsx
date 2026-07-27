import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card } from '../../components';

// Mock Data
const PHARMACIES = [
  { id: '1', name: 'MediCare Pharmacy', address: '123 Health Ave, NY', status: 'Open 24/7', distance: '1.2 km' },
  { id: '2', name: 'GreenCross Drugs', address: '45 Wellness Blvd, NY', status: 'Closes at 10 PM', distance: '2.5 km' },
  { id: '3', name: 'CityHealth Rx', address: '78 Cure St, NY', status: 'Open 24/7', distance: '3.0 km' },
];

export default function PharmacyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pharmacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={PHARMACIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBg}>
                <Ionicons name="medical" size={24} color={Colors.secondary[600]} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.address}>{item.address}</Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.status, item.status.includes('Open') ? styles.openText : styles.closedText]}>
                    {item.status}
                  </Text>
                  <Text style={styles.distance}>• {item.distance}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>Order</Text>
            </TouchableOpacity>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pharmacies found nearby.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    flex: 1,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.secondary[50],
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  status: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  openText: {
    color: Colors.success.main,
  },
  closedText: {
    color: Colors.warning.main,
  },
  distance: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
  },
  actionBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.secondary[600],
    borderRadius: 8,
  },
  actionText: {
    color: Colors.text.inverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
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
