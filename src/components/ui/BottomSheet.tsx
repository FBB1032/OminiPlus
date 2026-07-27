import React, { memo, useCallback } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  ViewStyle,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: number | string;
  snapPoints?: number[];
  showHandle?: boolean;
  containerStyle?: ViewStyle;
  animationType?: 'none' | 'fade' | 'slide';
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const BottomSheet = memo<BottomSheetProps>(({
  visible,
  onClose,
  children,
  title,
  height = '80%',
  snapPoints,
  showHandle = true,
  containerStyle,
  animationType = 'slide',
}) => {
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, { dy }) => Math.abs(dy) > 5,
      onPanResponderMove: (evt, { dy }) => {
        if (dy > 0) {
          pan.y.setValue(dy);
        }
      },
      onPanResponderRelease: (evt, { dy, vy }) => {
        if (dy > 100 || vy > 1) {
          Animated.timing(pan, {
            toValue: { x: 0, y: SCREEN_HEIGHT },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onClose();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 40,
            friction: 8,
          }).start();
        }
      },
    })
  );

  const numHeight = typeof height === 'string'
    ? parseInt(height) / 100 * SCREEN_HEIGHT
    : height;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.container,
          {
            height: numHeight,
            transform: [{ translateY: pan.y }],
          },
          containerStyle,
        ]}
        {...panResponder.current.panHandlers}
      >
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        {title && (
          <View style={styles.header}>
            <View style={styles.headerInner}>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {/* Close button - can be styled differently */}
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
});

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing[3],
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
});
