import React, { memo, useState, useRef } from 'react';
import {
  RefreshControl,
  RefreshControlProps,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { HeartbeatLoader } from './HeartbeatLoader';
import { Colors } from '../../theme';

export interface HeartbeatRefreshControlProps extends Omit<RefreshControlProps, 'colors' | 'tintColor'> {
  refreshing: boolean;
  onRefresh: () => void;
  color?: string;
  message?: string;
}

/**
 * Native-integrated RefreshControl that hides the default system circle
 * and provides smooth pull-to-refresh integration.
 */
export const HeartbeatRefreshControl = memo<HeartbeatRefreshControlProps>(({
  refreshing,
  onRefresh,
  color = '#0F6E6E',
  ...rest
}) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      // Hide the native iOS circular spinner so only our custom beating heart shows!
      tintColor={Platform.OS === 'ios' ? 'transparent' : color}
      colors={Platform.OS === 'android' ? [color, '#14B8A6'] : ['transparent']}
      progressBackgroundColor="#FFFFFF"
      {...rest}
    />
  );
});

/**
 * Animated Beating Heart Header shown at the top of a screen or list during reload.
 */
export const HeartbeatRefreshHeader = memo<{
  refreshing: boolean;
  color?: string;
  message?: string;
}>(({
  refreshing,
  color = '#0F6E6E',
  message = 'Updating pulse data...',
}) => {
  if (!refreshing) return null;

  return (
    <View style={[styles.headerBanner, { backgroundColor: `${color}0A` }]}>
      <HeartbeatLoader size="sm" color={color} showEcg={true} message={message} />
    </View>
  );
});

/**
 * Complete drop-in ScrollView replacement that shows the OminiPulse beating heart
 * when pulled down or refreshing.
 */
export interface HeartbeatScrollViewProps extends ScrollViewProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  heartColor?: string;
  refreshMessage?: string;
}

export const HeartbeatScrollView = ({
  refreshing = false,
  onRefresh,
  heartColor = '#0F6E6E',
  refreshMessage = 'Syncing health pulse...',
  children,
  ...scrollViewProps
}: HeartbeatScrollViewProps) => {
  const [isPulling, setIsPulling] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (offsetY < -20) {
      setIsPulling(true);
    } else if (!refreshing && offsetY >= 0) {
      setIsPulling(false);
    }
    if (scrollViewProps.onScroll) {
      scrollViewProps.onScroll(e);
    }
  };

  const showHeart = refreshing || isPulling;

  return (
    <View style={styles.container}>
      {/* Animated Beating Heart top indicator */}
      {showHeart && (
        <View style={[styles.pullBanner, { backgroundColor: `${heartColor}0D` }]}>
          <HeartbeatLoader
            size="sm"
            color={heartColor}
            showEcg={true}
            message={refreshing ? refreshMessage : 'Release to refresh'}
          />
        </View>
      )}

      <ScrollView
        {...scrollViewProps}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="transparent"
              colors={['transparent']}
              progressBackgroundColor="transparent"
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
};

HeartbeatRefreshControl.displayName = 'HeartbeatRefreshControl';
HeartbeatRefreshHeader.displayName = 'HeartbeatRefreshHeader';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBanner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 110, 110, 0.08)',
  },
  pullBanner: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 110, 110, 0.1)',
  },
});
