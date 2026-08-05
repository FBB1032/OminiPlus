import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { Card, Button, Input } from '../../components';
import { useFamilyStore } from '../../store/familyStore';
import { FamilyMemberProfile, RelationshipType } from '../../types/family';

const RELATIONSHIP_OPTIONS: { label: string; value: RelationshipType }[] = [
  { label: 'Spouse / Wife', value: 'spouse' },
  { label: 'Son / Daughter (Child)', value: 'child' },
  { label: 'Father / Mother (Elderly)', value: 'parent' },
];

export default function FamilyAccountsScreen({ navigation }: any) {
  const { members, activeMember, loadMembers, setActiveMember, addMember, deleteMember } = useFamilyStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('spouse');
  const [dob, setDob] = useState('1995-05-15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodGroup, setBloodGroup] = useState('O+');

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please enter first name and last name.');
      return;
    }

    const relLabel =
      relationship === 'spouse'
        ? 'Spouse'
        : relationship === 'child'
        ? 'Child'
        : 'Elderly Parent';

    await addMember({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      relationship,
      relationshipLabel: relLabel,
      dateOfBirth: dob,
      gender,
      bloodGroup,
    });

    setFirstName('');
    setLastName('');
    setModalVisible(false);
    Alert.alert('Success', `${firstName} added to family account.`);
  };

  const handleDelete = (member: FamilyMemberProfile) => {
    if (member.isPrimary) {
      Alert.alert('Restricted', 'Primary profile cannot be deleted.');
      return;
    }

    Alert.alert('Remove Profile', `Remove ${member.firstName} from your family account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMember(member.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Accounts</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="person-add-outline" size={22} color={Colors.secondary[600]} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <View style={styles.infoIconBox}>
              <Ionicons name="people" size={24} color={Colors.primary[700]} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.infoTitle}>Family Healthcare Portal</Text>
              <Text style={styles.infoText}>
                Manage healthcare records, doctor appointments, and medication reminders for your wife, kids, and elderly parents from one account.
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }: { item: FamilyMemberProfile }) => {
          const isActive = item.id === activeMember?.id;
          return (
            <Card style={[styles.memberCard, isActive && styles.memberCardActive]}>
              <View style={styles.cardRow}>
                <View style={[styles.avatarBox, isActive && styles.avatarBoxActive]}>
                  <Ionicons
                    name={
                      item.relationship === 'child'
                        ? 'accessibility'
                        : item.gender === 'female'
                        ? 'person-sharp'
                        : 'person'
                    }
                    size={22}
                    color={isActive ? Colors.surface : Colors.primary[600]}
                  />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    {item.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.relationText}>{item.relationshipLabel}</Text>
                  <Text style={styles.detailsText}>
                    DOB: {item.dateOfBirth} • Blood: {item.bloodGroup || 'N/A'}
                  </Text>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity
                    onPress={() => setActiveMember(item.id)}
                    style={[styles.switchBtn, isActive && styles.switchBtnActive]}
                  >
                    <Text style={[styles.switchText, isActive && styles.switchTextActive]}>
                      {isActive ? 'Active' : 'Switch'}
                    </Text>
                  </TouchableOpacity>

                  {!item.isPrimary && (
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {item.chronicConditions && item.chronicConditions.length > 0 && (
                <View style={styles.conditionsRow}>
                  <Text style={styles.conditionsLabel}>Tracked Conditions:</Text>
                  <View style={styles.tagWrap}>
                    {item.chronicConditions.map((c) => (
                      <View key={c} style={styles.conditionTag}>
                        <Text style={styles.conditionTagText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          );
        }}
      />

      <View style={styles.bottomBar}>
        <Button
          label="Add Family Member Profile"
          leftIcon={<Ionicons name="add-circle-outline" size={20} color={Colors.text.inverse} />}
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Add Member Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.label}>Relationship</Text>
              <View style={styles.optionsRow}>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setRelationship(opt.value)}
                    style={[styles.optCard, relationship === opt.value && styles.optCardActive]}
                  >
                    <Text style={[styles.optText, relationship === opt.value && styles.optTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>First Name</Text>
              <Input placeholder="e.g. Aisha, Leo, Ibrahim" value={firstName} onChangeText={setFirstName} />

              <Text style={styles.label}>Last Name</Text>
              <Input placeholder="e.g. Doe" value={lastName} onChangeText={setLastName} />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionsRow}>
                {(['male', 'female'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={[styles.optCard, gender === g && styles.optCardActive]}
                  >
                    <Text style={[styles.optText, gender === g && styles.optTextActive]}>
                      {g === 'male' ? 'Male' : 'Female'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <Input placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />

              <Text style={styles.label}>Blood Group</Text>
              <Input placeholder="e.g. O+, A+, B+" value={bloodGroup} onChangeText={setBloodGroup} />

              <View style={styles.modalBtnRow}>
                <Button label="Save Family Profile" onPress={handleAddMember} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    padding: Spacing[1],
  },
  container: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing[4],
    gap: Spacing[3],
    marginBottom: Spacing[2],
  },
  infoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[900],
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.primary[800],
    lineHeight: 18,
  },
  memberCard: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  memberCardActive: {
    borderColor: Colors.primary[400],
    backgroundColor: '#FAFCFF',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBoxActive: {
    backgroundColor: Colors.primary[600],
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  memberName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  primaryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#92400E',
  },
  relationText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.secondary[600],
  },
  detailsText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: Spacing[2],
  },
  switchBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchBtnActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  switchText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  switchTextActive: {
    color: Colors.text.inverse,
  },
  deleteBtn: {
    padding: 4,
  },
  conditionsRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[2],
    gap: 4,
  },
  conditionsLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  tagWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  conditionTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  conditionTagText: {
    fontSize: 11,
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
  },
  bottomBar: {
    padding: Spacing[4],
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: Spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  modalScroll: {
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  optCard: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optCardActive: {
    backgroundColor: Colors.secondary[600],
    borderColor: Colors.secondary[600],
  },
  optText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  optTextActive: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.bold,
  },
  modalBtnRow: {
    marginTop: Spacing[2],
  },
});
