import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
  rightActionSecondary?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
  variant?: 'default' | 'card' | 'transparent';
  backgroundColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const ScreenHeader = memo<ScreenHeaderProps>(({
  title,
  subtitle,
  showBackButton = true,
  onBackPress,
  rightAction,
  rightActionSecondary,
  variant = 'default',
  backgroundColor,
  style,
  titleStyle,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: backgroundColor || Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    card: {
      backgroundColor: backgroundColor || Colors.primary[50],
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing[4],
      marginVertical: Spacing[3],
      paddingVertical: Spacing[4],
      paddingHorizontal: Spacing[4],
    },
    transparent: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        variantStyles[variant],
        style,
      ]}
      edges={variant === 'default' ? ['top'] : undefined}
    >
      <View style={styles.contentContainer}>
        {/* Left Section - Back Button */}
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section - Title & Subtitle */}
        <View style={[styles.centerSection, !showBackButton && styles.centerSectionFull]}>
          <Text
            style={[styles.title, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          {rightActionSecondary && (
            <TouchableOpacity
              onPress={rightActionSecondary.onPress}
              style={styles.actionButton}
              accessibilityLabel={rightActionSecondary.label}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightActionSecondary.icon}
                size={20}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
          )}
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.actionButton}
              accessibilityLabel={rightAction.label}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={rightAction.icon}
                size={20}
                color={Colors.primary[600]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
});

ScreenHeader.displayName = 'ScreenHeader';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: Spacing[2],
  },
  centerSection: {
    flex: 1,
    marginHorizontal: Spacing[3],
  },
  centerSectionFull: {
    marginHorizontal: 0,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  rightSection: {
    width: 40,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing[2],
  },
  actionButton: {
    padding: Spacing[2],
  },
});
