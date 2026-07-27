import React, { memo, useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../../theme';
import { getInitials } from '../../utils/formatters';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
  showBorder?: boolean;
  gender?: 'male' | 'female' | string;
}

const sizeMap: Record<AvatarSize, { container: number; fontSize: number; iconSize: number }> = {
  xs: { container: 28, fontSize: FontSize.xs, iconSize: 16 },
  sm: { container: 36, fontSize: FontSize.sm, iconSize: 20 },
  md: { container: 44, fontSize: FontSize.base, iconSize: 24 },
  lg: { container: 56, fontSize: FontSize.lg, iconSize: 32 },
  xl: { container: 72, fontSize: FontSize.xl, iconSize: 40 },
};

// Generates a consistent color from a name string
const nameToColor = (name: string): string => {
  const palette = [
    Colors.primary[600],
    Colors.secondary[600],
    '#7C3AED',
    '#059669',
    '#D97706',
    '#2563EB',
    '#0891B2',
  ];
  let hash = 0;
  const str = name || 'User';
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
};

export const Avatar = memo<AvatarProps>(({ name, uri, size = 'md', style, showBorder = false, gender }) => {
  const { container, fontSize, iconSize } = sizeMap[size];
  const bg = nameToColor(name);
  const initials = getInitials(name || 'User');
  const [imageError, setImageError] = useState(false);

  const renderFallback = () => {
    if (gender === 'female') {
      return <Ionicons name="woman" size={iconSize} color="#FFFFFF" />;
    }
    if (gender === 'male') {
      return <Ionicons name="man" size={iconSize} color="#FFFFFF" />;
    }
    return <Text style={[styles.initials, { fontSize }]}>{initials}</Text>;
  };

  return (
    <View
      style={[
        styles.base,
        { width: container, height: container, borderRadius: container / 2, backgroundColor: bg },
        showBorder && styles.border,
        style,
      ]}
    >
      {uri && !imageError ? (
        <Image
          source={{ uri }}
          style={{ width: container, height: container, borderRadius: container / 2 }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        renderFallback()
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  border: { borderWidth: 2, borderColor: Colors.neutral[0] },
  initials: { color: Colors.neutral[0], fontWeight: FontWeight.bold, includeFontPadding: false },
});
