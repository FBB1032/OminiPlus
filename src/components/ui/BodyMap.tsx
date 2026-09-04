import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Shadows } from '../../theme';
import { PainLog } from '../../types';

const front3DImage = require('../../../assets/images/body_3d_front.jpg');
const back3DImage = require('../../../assets/images/body_3d_back.jpg');

export type BodyPartId =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'
  | 'back';

interface BodyMapProps {
  painLogs?: PainLog[];
  onPartPress?: (partId: BodyPartId) => void;
  interactive?: boolean;
  selectedPartId?: BodyPartId | null;
}

interface HotspotConfig {
  id: BodyPartId;
  name: string;
  top: `${number}%`;
  left: `${number}%`;
  width: `${number}%`;
  height: `${number}%`;
}

const FRONT_HOTSPOTS: HotspotConfig[] = [
  { id: 'head', name: 'Head', top: '5%', left: '40%', width: '20%', height: '11%' },
  { id: 'neck', name: 'Neck', top: '16%', left: '42%', width: '16%', height: '6%' },
  { id: 'chest', name: 'Chest', top: '22%', left: '34%', width: '32%', height: '12%' },
  { id: 'abdomen', name: 'Stomach', top: '34%', left: '36%', width: '28%', height: '13%' },
  { id: 'right_arm', name: 'R. Arm', top: '22%', left: '20%', width: '14%', height: '32%' },
  { id: 'left_arm', name: 'L. Arm', top: '22%', left: '66%', width: '14%', height: '32%' },
  { id: 'right_leg', name: 'R. Leg', top: '48%', left: '33%', width: '16%', height: '44%' },
  { id: 'left_leg', name: 'L. Leg', top: '48%', left: '51%', width: '16%', height: '44%' },
];

const BACK_HOTSPOTS: HotspotConfig[] = [
  { id: 'head', name: 'Head', top: '5%', left: '40%', width: '20%', height: '11%' },
  { id: 'neck', name: 'Neck', top: '16%', left: '42%', width: '16%', height: '6%' },
  { id: 'back', name: 'Back & Spine', top: '22%', left: '33%', width: '34%', height: '26%' },
  { id: 'left_arm', name: 'L. Arm', top: '22%', left: '20%', width: '14%', height: '32%' },
  { id: 'right_arm', name: 'R. Arm', top: '22%', left: '66%', width: '14%', height: '32%' },
  { id: 'left_leg', name: 'L. Leg', top: '48%', left: '33%', width: '16%', height: '44%' },
  { id: 'right_leg', name: 'R. Leg', top: '48%', left: '51%', width: '16%', height: '44%' },
];

export const BodyMap = ({
  painLogs = [],
  onPartPress,
  interactive = false,
  selectedPartId = null,
}: BodyMapProps) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');

  // Pulse animation for active pain spots
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const getLogForPart = (partId: BodyPartId) => {
    return painLogs.find((l) => l.bodyPartId === partId);
  };

  const getPartColor = (sev?: number) => {
    if (!sev) return '#0F6E6E';
    if (sev >= 7) return '#EF4444'; // Severe (Red: 7 - 10)
    if (sev >= 4) return '#F97316'; // Moderate (Orange: 4 - 6)
    return '#EAB308'; // Mild (Yellow: 1 - 3)
  };

  const handlePress = (partId: BodyPartId) => {
    if (interactive && onPartPress) {
      onPartPress(partId);
    }
  };

  const currentHotspots = activeView === 'front' ? FRONT_HOTSPOTS : BACK_HOTSPOTS;

  return (
    <View style={styles.outerContainer}>
      {/* 3D Perspective View Switcher */}
      <View style={styles.topControlRow}>
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.viewTab, activeView === 'front' && styles.viewTabActive]}
            onPress={() => setActiveView('front')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="body"
              size={13}
              color={activeView === 'front' ? '#FFFFFF' : Colors.text.secondary}
            />
            <Text style={[styles.viewTabText, activeView === 'front' && styles.viewTabTextActive]}>
              Front View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewTab, activeView === 'back' && styles.viewTabActive]}
            onPress={() => setActiveView('back')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="body-outline"
              size={13}
              color={activeView === 'back' ? '#FFFFFF' : Colors.text.secondary}
            />
            <Text style={[styles.viewTabText, activeView === 'back' && styles.viewTabTextActive]}>
              Back View
            </Text>
          </TouchableOpacity>
        </View>

        {interactive && (
          <View style={styles.interactiveHint}>
            <Ionicons name="finger-print-outline" size={13} color={Colors.primary[600]} />
            <Text style={styles.interactiveHintText}>Tap region</Text>
          </View>
        )}
      </View>

      {/* 3D Model Display Stage */}
      <View style={styles.stageContainer}>
        {/* Holographic scanner aesthetic corners */}
        <View style={[styles.scannerCorner, styles.cornerTL]} />
        <View style={[styles.scannerCorner, styles.cornerTR]} />
        <View style={[styles.scannerCorner, styles.cornerBL]} />
        <View style={[styles.scannerCorner, styles.cornerBR]} />

        {/* 3D Mannequin Image */}
        <Image
          source={activeView === 'front' ? front3DImage : back3DImage}
          style={styles.modelImage}
          resizeMode="contain"
        />

        {/* Interactive Hotspot Overlays */}
        {currentHotspots.map((spot) => {
          const log = getLogForPart(spot.id);
          const hasLog = Boolean(log);
          const isSelected = selectedPartId === spot.id;
          const color = getPartColor(log?.severity);

          return (
            <TouchableOpacity
              key={`${activeView}-${spot.id}`}
              style={[
                styles.hotspotTouchArea,
                {
                  top: spot.top,
                  left: spot.left,
                  width: spot.width,
                  height: spot.height,
                },
                hasLog && {
                  backgroundColor: `${color}33`,
                  borderColor: color,
                  borderWidth: 2,
                  borderRadius: 12,
                },
                isSelected && !hasLog && {
                  backgroundColor: 'rgba(15, 110, 110, 0.22)',
                  borderColor: '#0F6E6E',
                  borderWidth: 2,
                  borderRadius: 12,
                },
                isSelected && hasLog && {
                  borderColor: '#FFFFFF',
                  borderWidth: 2.5,
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 10,
                  elevation: 8,
                },
                hasLog && styles.hotspotWithLog,
              ]}
              onPress={() => handlePress(spot.id)}
              disabled={!interactive}
              activeOpacity={0.7}
            >
              {hasLog ? (
                <View style={styles.pinContainer}>
                  {/* Glowing 3D Radial Halo */}
                  <Animated.View
                    style={[
                      styles.haloGlow,
                      {
                        backgroundColor: color,
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                  {/* 3D Center Pin Badge with Number */}
                  <View style={[styles.centerPin, { backgroundColor: color }]}>
                    <Text style={styles.pinSeverityText}>{log?.severity}</Text>
                  </View>
                  {/* Hotspot Floating Label */}
                  <View
                    style={[
                      styles.floatingBadge,
                      { borderColor: color, backgroundColor: color },
                      spot.id === 'head' && { top: 22 },
                    ]}
                  >
                    <Text style={[styles.floatingBadgeText, { color: '#FFFFFF' }]}>
                      {spot.name}: {log?.severity}
                    </Text>
                  </View>
                </View>
              ) : interactive ? (
                <View style={[styles.unmappedTarget, isSelected && { borderColor: '#0F6E6E', borderWidth: 2 }]}>
                  <View style={[styles.targetDot, isSelected && { backgroundColor: '#0F6E6E' }]} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Access Region Chips for Easy Mobile Tapping */}
      {interactive && (
        <View style={styles.chipsSection}>
          <Text style={styles.chipsTitle}>Quick Select Region:</Text>
          <View style={styles.chipsContainer}>
            {currentHotspots.map((spot) => {
              const log = getLogForPart(spot.id);
              const hasLog = Boolean(log);
              const color = getPartColor(log?.severity);

              return (
                <TouchableOpacity
                  key={spot.id}
                  style={[
                    styles.regionChip,
                    hasLog && { backgroundColor: `${color}18`, borderColor: color },
                  ]}
                  onPress={() => handlePress(spot.id)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: hasLog ? color : '#CBD5E1' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      hasLog && { color: color, fontWeight: '700' },
                    ]}
                  >
                    {spot.name}
                    {hasLog ? ` (${log?.severity}/10)` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Modern Severity Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Severe (7-10)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Moderate (4-6)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.legendText}>Mild (1-3)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing[4],
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    width: '100%',
    ...Shadows.md,
  },
  topControlRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 11,
  },
  viewTabActive: {
    backgroundColor: Colors.primary[600],
    ...Shadows.sm,
  },
  viewTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.text.secondary,
  },
  viewTabTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  interactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  interactiveHintText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary[700],
  },
  stageContainer: {
    width: 290,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFDFD',
    borderRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E6F4F1',
    overflow: 'hidden',
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  scannerCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: Colors.primary[300],
    zIndex: 2,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  hotspotTouchArea: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hotspotWithLog: {
    zIndex: 20,
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.35,
  },
  centerPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Shadows.sm,
  },
  pinSeverityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingBadge: {
    position: 'absolute',
    top: -18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  floatingBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  unmappedTarget: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 110, 110, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(15, 110, 110, 0.25)',
  },
  targetDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary[500],
    opacity: 0.6,
  },
  chipsSection: {
    width: '100%',
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  chipsTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.text.primary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
});

export default BodyMap;
