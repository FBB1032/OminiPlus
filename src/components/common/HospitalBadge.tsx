import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../../theme';

interface HospitalBadgeProps {
  hospitalName?: string;
  isIndependent?: boolean;
  isVerified?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const HospitalBadge: React.FC<HospitalBadgeProps> = ({
  hospitalName,
  isIndependent = false,
  isVerified = true,
  size = 'md',
  style,
}) => {
  const isSmall = size === 'sm';

  if (isIndependent || !hospitalName) {
    return (
      <View
        style={[
          styles.badge,
          styles.independentBadge,
          isSmall && styles.badgeSm,
          style,
        ]}
      >
        <Ionicons
          name="medkit-outline"
          size={isSmall ? 11 : 13}
          color={Colors.primary[700]}
          style={styles.icon}
        />
        <Text
          style={[
            styles.text,
            styles.independentText,
            isSmall && styles.textSm,
          ]}
          numberOfLines={1}
        >
          Independent Specialist
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        styles.hospitalBadge,
        isSmall && styles.badgeSm,
        style,
      ]}
    >
      <Ionicons
        name="business-outline"
        size={isSmall ? 11 : 13}
        color="#0F6E6E"
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          styles.hospitalText,
          isSmall && styles.textSm,
        ]}
        numberOfLines={1}
      >
        {hospitalName}
      </Text>
      {isVerified && (
        <Ionicons
          name="shield-checkmark-outline"
          size={isSmall ? 10 : 12}
          color="#0F6E6E"
          style={styles.verifiedIcon}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hospitalBadge: {
    backgroundColor: '#E6F4F4',
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  independentBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  icon: {
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    flexShrink: 1,
  },
  textSm: {
    fontSize: 10,
  },
  hospitalText: {
    color: '#0D5454',
  },
  independentText: {
    color: '#3730A3',
  },
});
