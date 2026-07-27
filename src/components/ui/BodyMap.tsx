import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Svg, { Rect, Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, FontSize, FontWeight } from '../../theme';
import { PainLog } from '../../types';

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
}

export const BodyMap = ({
  painLogs = [],
  onPartPress,
  interactive = false,
}: BodyMapProps) => {
  const getPartColor = (partId: BodyPartId) => {
    const log = painLogs.find((l) => l.bodyPartId === partId);
    if (!log) {
      return '#E2E8F0'; // Default neutral light grey
    }
    const sev = log.severity;
    if (sev >= 8) return '#EF4444'; // Severe (Red)
    if (sev >= 4) return '#F97316'; // Moderate (Orange)
    return '#EAB308'; // Mild (Yellow)
  };

  const handlePress = (partId: BodyPartId) => {
    if (interactive && onPartPress) {
      onPartPress(partId);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.labelsRow}>
        <Text style={styles.viewLabel}>Front View</Text>
        <Text style={styles.viewLabel}>Back View</Text>
      </View>
      
      <View style={styles.svgRow}>
        <Svg width="300" height="280" viewBox="0 0 320 280">
          {/* ================= FRONT VIEW ================= */}
          <G transform="translate(10, 0)">
            {/* Front Head */}
            <G onPress={() => handlePress('head')}>
              <Circle
                cx="70"
                cy="35"
                r="18"
                fill={getPartColor('head')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="70" y="38" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                Head
              </SvgText>
            </G>

            {/* Front Neck */}
            <G onPress={() => handlePress('neck')}>
              <Rect
                x="65"
                y="53"
                width="10"
                height="10"
                rx="2"
                fill={getPartColor('neck')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>

            {/* Front Chest */}
            <G onPress={() => handlePress('chest')}>
              <Path
                d="M 45 68 L 95 68 L 90 110 L 50 110 Z"
                fill={getPartColor('chest')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="70" y="90" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                Chest
              </SvgText>
            </G>

            {/* Front Abdomen */}
            <G onPress={() => handlePress('abdomen')}>
              <Path
                d="M 50 112 L 90 112 L 85 150 L 55 150 Z"
                fill={getPartColor('abdomen')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="70" y="133" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                Stomach
              </SvgText>
            </G>

            {/* Front Left Arm */}
            <G onPress={() => handlePress('left_arm')}>
              <Path
                d="M 42 68 Q 30 100 25 130 L 35 130 Q 38 100 48 72 Z"
                fill={getPartColor('left_arm')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="30" y="110" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                L. Arm
              </SvgText>
            </G>

            {/* Front Right Arm */}
            <G onPress={() => handlePress('right_arm')}>
              <Path
                d="M 98 68 Q 110 100 115 130 L 105 130 Q 102 100 92 72 Z"
                fill={getPartColor('right_arm')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="110" y="110" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                R. Arm
              </SvgText>
            </G>

            {/* Front Left Leg */}
            <G onPress={() => handlePress('left_leg')}>
              <Path
                d="M 50 152 L 68 152 L 62 250 L 48 250 Z"
                fill={getPartColor('left_leg')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="58" y="200" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                L. Leg
              </SvgText>
            </G>

            {/* Front Right Leg */}
            <G onPress={() => handlePress('right_leg')}>
              <Path
                d="M 72 152 L 90 152 L 92 250 L 78 250 Z"
                fill={getPartColor('right_leg')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="82" y="200" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                R. Leg
              </SvgText>
            </G>
          </G>

          {/* ================= BACK VIEW ================= */}
          <G transform="translate(170, 0)">
            {/* Back Head */}
            <G onPress={() => handlePress('head')}>
              <Circle
                cx="70"
                cy="35"
                r="18"
                fill={getPartColor('head')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="70" y="38" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                Back Head
              </SvgText>
            </G>

            {/* Back Neck */}
            <G onPress={() => handlePress('neck')}>
              <Rect
                x="65"
                y="53"
                width="10"
                height="10"
                rx="2"
                fill={getPartColor('neck')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>

            {/* Back Torso (Back) */}
            <G onPress={() => handlePress('back')}>
              <Path
                d="M 45 68 L 95 68 L 90 150 L 50 150 Z"
                fill={getPartColor('back')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
              <SvgText x="70" y="105" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#1E293B">
                Back/Spine
              </SvgText>
            </G>

            {/* Back Left Arm (Mirrored right side in back view) */}
            <G onPress={() => handlePress('left_arm')}>
              <Path
                d="M 42 68 Q 30 100 25 130 L 35 130 Q 38 100 48 72 Z"
                fill={getPartColor('left_arm')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>

            {/* Back Right Arm */}
            <G onPress={() => handlePress('right_arm')}>
              <Path
                d="M 98 68 Q 110 100 115 130 L 105 130 Q 102 100 92 72 Z"
                fill={getPartColor('right_arm')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>

            {/* Back Left Leg */}
            <G onPress={() => handlePress('left_leg')}>
              <Path
                d="M 50 152 L 68 152 L 62 250 L 48 250 Z"
                fill={getPartColor('left_leg')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>

            {/* Back Right Leg */}
            <G onPress={() => handlePress('right_leg')}>
              <Path
                d="M 72 152 L 90 152 L 92 250 L 78 250 Z"
                fill={getPartColor('right_leg')}
                stroke={interactive ? Colors.primary[600] : '#94A3B8'}
                strokeWidth="1.5"
              />
            </G>
          </G>
        </Svg>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Severe (8-10)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Moderate (4-7)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
          <Text style={styles.legendText}>Mild (1-3)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.surface,
    padding: Spacing[3],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    width: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: Spacing[2],
  },
  viewLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text.secondary,
  },
  svgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
  },
});
