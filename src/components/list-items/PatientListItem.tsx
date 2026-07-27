import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';

export interface PatientListItemData {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  bloodType?: string;
  bloodGroup?: string;
  genotype?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

interface PatientListItemProps {
  item: PatientListItemData;
  onPress: () => void;
  showDetails?: boolean;
  containerStyle?: ViewStyle;
}

export const PatientListItem = memo<PatientListItemProps>(({
  item,
  onPress,
  showDetails = true,
  containerStyle,
}) => {
  // Calculate age from date of birth
  const getAge = () => {
    if (!item.dateOfBirth) return null;
    const birthDate = new Date(item.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, containerStyle]}
    >
      <Avatar
        name={`${item.firstName} ${item.lastName}`}
        uri={item.avatarUrl}
        size="md"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        {showDetails && (
          <View style={styles.details}>
            {age && (
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{age} years</Text>
                <View style={styles.dot} />
              </View>
            )}
            {item.gender && (
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{item.gender}</Text>
                <View style={styles.dot} />
              </View>
            )}
            {(item.bloodGroup || item.bloodType) && (
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>Blood: {item.bloodGroup || item.bloodType}</Text>
              </View>
            )}
          </View>
        )}
        {item.email && (
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  );
});

PatientListItem.displayName = 'PatientListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: 12,
    marginVertical: Spacing[2],
    ...Shadows.xs,
  },
  info: {
    flex: 1,
    marginLeft: Spacing[3],
    gap: 4,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.secondary,
  },
  email: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
});
