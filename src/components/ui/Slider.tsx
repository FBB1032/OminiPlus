import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../theme';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showLabel?: boolean;
  showTicks?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  trackHeight?: number;
  thumbSize?: number;
}

export const Slider = memo<SliderProps>(({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showLabel = true,
  showTicks = true,
  disabled = false,
  containerStyle,
  labelStyle,
  trackHeight = 4,
  thumbSize = 24,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const pan = React.useRef(new Animated.Value(0)).current;

  // Calculate thumb position based on value
  useEffect(() => {
    if (trackWidth > 0) {
      const ratio = (value - min) / (max - min);
      const thumbPos = ratio * (trackWidth - thumbSize);
      Animated.timing(pan, {
        toValue: thumbPos,
        duration: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [value, trackWidth]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (evt, { dx }) => {
        const ratio = dx / trackWidth;
        let newValue = min + ratio * (max - min);
        newValue = Math.round(newValue / step) * step;
        newValue = Math.max(min, Math.min(max, newValue));
        onChange(newValue);
      },
      onPanResponderRelease: () => {
        // Optional: Add haptic feedback here
      },
    })
  );

  const ratio = (value - min) / (max - min);
  const thumbPos = ratio * (trackWidth - thumbSize);

  // Generate tick marks
  const ticks = [];
  if (showTicks) {
    for (let i = min; i <= max; i += (max - min) / 4) {
      ticks.push(i);
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.labelText, labelStyle]}>{label}</Text>
          {showLabel && (
            <Text style={styles.valueText}>
              {value} {max === 100 && value === 1 ? 'point' : max === 100 ? 'points' : ''}
            </Text>
          )}
        </View>
      )}

      {/* Ticks */}
      {showTicks && (
        <View style={styles.ticksContainer}>
          {ticks.map((tick, idx) => (
            <View
              key={idx}
              style={[
                styles.tick,
                (tick === min || tick === max) && styles.tickEnd,
              ]}
            >
              <Text style={styles.tickLabel}>{Math.round(tick)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Slider Track and Thumb */}
      <View style={styles.sliderContainer}>
        <View
          style={[
            styles.track,
            {
              height: trackHeight,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
          onLayout={(event) => {
            setTrackWidth(event.nativeEvent.layout.width);
          }}
        >
          {/* Filled portion */}
          <View
            style={[
              styles.trackFilled,
              {
                width: `${ratio * 100}%`,
                height: trackHeight,
              },
            ]}
          />
        </View>

        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX: pan }],
            },
          ]}
          {...panResponder.current.panHandlers}
        >
          {/* Thumb inner circle for focus state */}
          <View style={styles.thumbInner} />
        </Animated.View>
      </View>

      {/* Value indicator */}
      {showLabel && (
        <View style={styles.valueIndicator}>
          <Text style={styles.valueIndicatorText}>{value}</Text>
        </View>
      )}
    </View>
  );
});

Slider.displayName = 'Slider';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  labelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  valueText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[600],
  },
  ticksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  tick: {
    alignItems: 'center',
  },
  tickEnd: {
    opacity: 0.7,
  },
  tickLabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing[1],
  },
  track: {
    width: '100%',
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
  },
  trackFilled: {
    backgroundColor: Colors.primary[600],
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: Colors.primary[600],
    borderWidth: 3,
    borderColor: Colors.surface,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    opacity: 0.5,
  },
  valueIndicator: {
    marginTop: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  valueIndicatorText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
});
