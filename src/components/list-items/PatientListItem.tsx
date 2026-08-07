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
import { Colors, Spacing, FontSize, FontWeight, Shadows, BorderRadius } from '../../theme';

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
      accessibilityRole="button"
      accessibilityLabel={`Patient ${item.firstName} ${item.lastName}`}
      accessibilityHint="Tap to view patient details"
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      <Avatar
        name={`${item.firstName} ${item.lastName}`}
        uri={item.avatarUrl}
        size="md"
      />
      <View style={styles.info}>
        <Text
          style={styles.name}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.firstName} {item.lastName}
        </Text>
        {showDetails && (
          <View style={styles.details}>
            {age && (
              <View style={styles.detailItem}>
                <Text
                  style={styles.detailText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {age} years
                </Text>
                <View style={styles.dot} />
              </View>
            )}
            {item.gender && (
              <View style={styles.detailItem}>
                <Text
                  style={styles.detailText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {item.gender}
                </Text>
                <View style={styles.dot} />
              </View>
            )}
            {(item.bloodGroup || item.bloodType) && (
              <View style={styles.detailItemNoDot}>
                <Text
                  style={styles.detailText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  Blood: {item.bloodGroup || item.bloodType}
                </Text>
              </View>
            )}
          </View>
        )}
        {item.email && (
          <Text
            style={styles.email}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {item.email}
          </Text>
        )}
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
      </View>
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
    borderRadius: BorderRadius.md,
    marginVertical: Spacing[2],
    minHeight: 72,
    overflow: 'hidden',
    ...Shadows.xs,
  },
  info: {
    flex: 1,
    flexShrink: 1,
    marginLeft: Spacing[3],
    gap: 4,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    flexShrink: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    flexShrink: 1,
  },
  detailItemNoDot: {
    flexShrink: 1,
  },
  detailText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flexShrink: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.secondary,
    flexShrink: 0,
  },
  email: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
    flexShrink: 1,
  },
  chevronWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: Spacing[2],
  },
});
