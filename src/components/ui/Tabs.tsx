import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  variant?: 'default' | 'pill' | 'underline';
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  activeTabLabelStyle?: TextStyle;
}

export const Tabs = memo<TabsProps>(({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  containerStyle,
  tabStyle,
  activeTabStyle,
  labelStyle,
  activeTabLabelStyle,
}) => {
  const scrollViewWidth = Dimensions.get('window').width;
  const tabWidth = scrollViewWidth / Math.min(tabs.length, 3);

  const animatedX = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.key === activeTab);
    Animated.timing(animatedX, {
      toValue: activeIndex * tabWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeTab, tabs, tabWidth]);

  const variantStyles = {
    default: {
      containerStyle: styles.defaultContainer,
      tabStyle: styles.defaultTab,
      activeTabStyle: styles.defaultActiveTab,
      labelStyle: styles.labelDefault,
      activeTabLabelStyle: styles.activeLabelDefault,
    },
    pill: {
      containerStyle: styles.pillContainer,
      tabStyle: styles.pillTab,
      activeTabStyle: styles.pillActiveTab,
      labelStyle: styles.labelPill,
      activeTabLabelStyle: styles.activeLabelPill,
    },
    underline: {
      containerStyle: styles.underlineContainer,
      tabStyle: styles.underlineTab,
      activeTabStyle: styles.underlineActiveTab,
      labelStyle: styles.labelUnderline,
      activeTabLabelStyle: styles.activeLabelUnderline,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <View style={[currentVariant.containerStyle, containerStyle]}>
      {/* Animated indicator */}
      {variant === 'underline' && (
        <Animated.View
          style={[
            styles.underlineIndicator,
            {
              width: tabWidth,
              transform: [{ translateX: animatedX }],
            },
          ]}
        />
      )}

      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              currentVariant.tabStyle,
              tabStyle,
              isActive && [currentVariant.activeTabStyle, activeTabStyle],
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  currentVariant.labelStyle,
                  labelStyle,
                  isActive && [
                    currentVariant.activeTabLabelStyle,
                    activeTabLabelStyle,
                  ],
                ]}
              >
                {tab.label}
              </Text>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

Tabs.displayName = 'Tabs';

const styles = StyleSheet.create({
  // Default variant
  defaultContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.lg,
    padding: Spacing[1],
    gap: Spacing[2],
  },
  defaultTab: {
    flex: 1,
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultActiveTab: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelDefault: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  activeLabelDefault: {
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
  },

  // Pill variant
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    padding: Spacing[1],
    gap: Spacing[2],
    alignSelf: 'flex-start',
  },
  pillTab: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActiveTab: {
    backgroundColor: Colors.primary[600],
  },
  labelPill: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  activeLabelPill: {
    color: Colors.text.inverse,
    fontWeight: FontWeight.semiBold,
  },

  // Underline variant
  underlineContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  underlineTab: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  underlineActiveTab: {},
  labelUnderline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
  activeLabelUnderline: {
    color: Colors.primary[600],
    fontWeight: FontWeight.semiBold,
  },
  underlineIndicator: {
    height: 2,
    backgroundColor: Colors.primary[600],
    borderRadius: 1,
    position: 'absolute',
    bottom: -2,
  },

  // Common styles
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  badge: {
    backgroundColor: Colors.error.main,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },
});
