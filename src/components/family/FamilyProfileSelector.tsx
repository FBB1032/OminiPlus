import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { useFamilyStore } from '../../store/familyStore';
import { FamilyMemberProfile } from '../../types/family';

interface FamilyProfileSelectorProps {
  onManagePress?: () => void;
}

export const FamilyProfileSelector: React.FC<FamilyProfileSelectorProps> = ({ onManagePress }) => {
  const { members, activeMember, setActiveMember } = useFamilyStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (id: string) => {
    setActiveMember(id);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectorPill}>
        <View style={styles.avatarMini}>
          <Ionicons name="person" size={12} color={Colors.primary[700]} />
        </View>
        <Text style={styles.memberName} numberOfLines={1}>
          {activeMember ? activeMember.firstName : 'Self'} ({activeMember?.relationshipLabel || 'Self'})
        </Text>
        <Ionicons name="chevron-down" size={14} color={Colors.text.secondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Switch Active Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.dropdownSubtitle}>
              Managing health records and reminders for selected family member:
            </Text>

            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }: { item: FamilyMemberProfile }) => {
                const isSelected = item.id === activeMember?.id;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.id)}
                    style={[styles.memberRow, isSelected && styles.memberRowSelected]}
                  >
                    <View style={[styles.avatarCircle, isSelected && styles.avatarCircleSelected]}>
                      <Ionicons
                        name={item.gender === 'female' ? 'person-sharp' : 'person'}
                        size={18}
                        color={isSelected ? Colors.surface : Colors.primary[600]}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowName, isSelected && styles.rowNameSelected]}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.rowRelation}>{item.relationshipLabel}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.secondary[600]} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {onManagePress && (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  onManagePress();
                }}
                style={styles.manageBtn}
              >
                <Ionicons name="people-outline" size={18} color={Colors.secondary[600]} />
                <Text style={styles.manageBtnText}>Manage Family Accounts</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    ...Shadows.sm,
  },
  avatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    maxWidth: 130,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing[4],
    gap: Spacing[2],
    ...Shadows.lg,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  dropdownSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: 10,
    gap: Spacing[3],
    marginBottom: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary[400],
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleSelected: {
    backgroundColor: Colors.primary[600],
  },
  rowName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  rowNameSelected: {
    color: Colors.primary[700],
  },
  rowRelation: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
    marginTop: 4,
  },
  manageBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.secondary[600],
  },
});
