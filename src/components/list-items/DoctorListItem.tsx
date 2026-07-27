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

export interface DoctorListItemData {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  consultationFee?: number;
  experience?: number;
}

interface DoctorListItemProps {
  item: DoctorListItemData;
  onPress: () => void;
  showRating?: boolean;
  showFee?: boolean;
  containerStyle?: ViewStyle;
}

export const DoctorListItem = memo<DoctorListItemProps>(({
  item,
  onPress,
  showRating = true,
  showFee = true,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, containerStyle]}
    >
      <Avatar
        name={`Dr. ${item.lastName}`}
        uri={item.avatarUrl}
        size="md"
      />
      <View style={styles.info}>
        <Text style={styles.name}>Dr. {item.firstName} {item.lastName}</Text>
        <Text style={styles.specialization}>{item.specialization}</Text>
        {item.experience && (
          <Text style={styles.experience}>{item.experience} years experience</Text>
        )}
        {showRating && item.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviewCount} reviews)
            </Text>
          </View>
        )}
      </View>
      {showFee && item.consultationFee && (
        <View style={styles.feeContainer}>
          <Text style={styles.fee}>${item.consultationFee}</Text>
          <Text style={styles.feeLabel}>per visit</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  );
});

DoctorListItem.displayName = 'DoctorListItem';

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
  specialization: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  experience: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    marginTop: Spacing[1],
  },
  ratingText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
  feeContainer: {
    alignItems: 'flex-end',
    marginRight: Spacing[2],
  },
  fee: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  feeLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
  },
});
