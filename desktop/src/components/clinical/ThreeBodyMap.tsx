'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCw, Eye, Layers, Activity, Sparkles, Sliders,
  Maximize2, Check, RefreshCw, Shield, AlertTriangle, Play, Pause,
  ZoomIn, ZoomOut, Compass, ChevronRight
} from 'lucide-react';

export type BodyPartKey =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'
  | 'back';

export interface ThreeBodyMapProps {
  activeRegion: string;
  onSelectRegion: (regionId: string) => void;
  severity?: number;
  onSelectSeverity?: (severity: number) => void;
  height?: number | string;
  showControls?: boolean;
}

interface HotspotConfig {
  id: BodyPartKey;
  name: string;
  mappedRegionId: string;
  top: number; // percentage from top (0-100)
  left: number; // percentage from left (0-100)
  width: number;
  height: number;
  hemisphere: 'front' | 'back';
}

const ALL_HOTSPOTS: HotspotConfig[] = [
  // Front Hemisphere Hotspots
  { id: 'head', name: 'Head & Cranium', mappedRegionId: 'Head', top: 4, left: 39, width: 22, height: 12, hemisphere: 'front' },
  { id: 'neck', name: 'Neck & Cervical', mappedRegionId: 'Head', top: 15, left: 42, width: 16, height: 7, hemisphere: 'front' },
  { id: 'chest', name: 'Chest & Heart', mappedRegionId: 'Chest', top: 21, left: 32, width: 36, height: 14, hemisphere: 'front' },
  { id: 'abdomen', name: 'Stomach & GI', mappedRegionId: 'Abdomen', top: 34, left: 34, width: 32, height: 14, hemisphere: 'front' },
  { id: 'right_arm', name: 'R. Arm & Shoulder', mappedRegionId: 'Upper Limbs', top: 21, left: 17, width: 16, height: 34, hemisphere: 'front' },
  { id: 'left_arm', name: 'L. Arm & Shoulder', mappedRegionId: 'Upper Limbs', top: 21, left: 67, width: 16, height: 34, hemisphere: 'front' },
  { id: 'right_leg', name: 'R. Leg & Knee', mappedRegionId: 'Lower Limbs', top: 47, left: 31, width: 18, height: 46, hemisphere: 'front' },
  { id: 'left_leg', name: 'L. Leg & Knee', mappedRegionId: 'Lower Limbs', top: 47, left: 51, width: 18, height: 46, hemisphere: 'front' },

  // Back Hemisphere Hotspots
  { id: 'head', name: 'Head & Occiput', mappedRegionId: 'Head', top: 4, left: 39, width: 22, height: 12, hemisphere: 'back' },
  { id: 'neck', name: 'Neck & Cervical', mappedRegionId: 'Spine', top: 15, left: 42, width: 16, height: 7, hemisphere: 'back' },
  { id: 'back', name: 'Back & Spine', mappedRegionId: 'Spine', top: 21, left: 31, width: 38, height: 28, hemisphere: 'back' },
  { id: 'left_arm', name: 'L. Arm (Posterior)', mappedRegionId: 'Upper Limbs', top: 21, left: 17, width: 16, height: 34, hemisphere: 'back' },
  { id: 'right_arm', name: 'R. Arm (Posterior)', mappedRegionId: 'Upper Limbs', top: 21, left: 67, width: 16, height: 34, hemisphere: 'back' },
  { id: 'left_leg', name: 'L. Hamstring & Calf', mappedRegionId: 'Lower Limbs', top: 47, left: 31, width: 18, height: 46, hemisphere: 'back' },
  { id: 'right_leg', name: 'R. Hamstring & Calf', mappedRegionId: 'Lower Limbs', top: 47, left: 51, width: 18, height: 46, hemisphere: 'back' },
];

export function ThreeBodyMap({
  activeRegion,
  onSelectRegion,
  severity = 5,
  onSelectSeverity,
  height = 440,
  showControls = true,
}: ThreeBodyMapProps) {
  // Continuous 360° rotation state in degrees (0° - 359°)
  const [rotationDeg, setRotationDeg] = useState(0);
  const [tiltXDeg, setTiltXDeg] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragStartRef = useRef<{ x: number; y: number; startRot: number; startTilt: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Normalize region mapping
  const normalizedRegion = activeRegion || 'Chest';

  const getSeverityColor = (sev: number) => {
    if (sev <= 3) return { hex: '#eab308', bg: '#fef9c3', text: '#854d0e', label: 'Mild Pain (1-3)' };
    if (sev <= 6) return { hex: '#f97316', bg: '#ffedd5', text: '#9a3412', label: 'Moderate Pain (4-6)' };
    return { hex: '#ef4444', bg: '#fee2e2', text: '#991b1b', label: 'Severe Pain (7-10)' };
  };

  const severityColor = getSeverityColor(severity);

  // Normalize rotation to 0 - 359
  const normalizedAngle = ((Math.round(rotationDeg) % 360) + 360) % 360;

  // Determine active visible hemisphere:
  // 0° is direct Anterior (Front).
  // 90° is Right Lateral profile.
  // 180° is direct Posterior (Back).
  // 270° is Left Lateral profile.
  const isFrontHemisphere = normalizedAngle <= 90 || normalizedAngle >= 270;
  const activeHemisphere: 'front' | 'back' = isFrontHemisphere ? 'front' : 'back';

  // Get anatomical orientation label
  const getOrientationLabel = (deg: number): string => {
    if (deg >= 340 || deg <= 20) return 'Anterior (Front)';
    if (deg > 20 && deg < 70) return 'Antero-Lateral (Right Oblique)';
    if (deg >= 70 && deg <= 110) return 'Right Lateral (Profile)';
    if (deg > 110 && deg < 160) return 'Postero-Lateral (Right)';
    if (deg >= 160 && deg <= 200) return 'Posterior (Back)';
    if (deg > 200 && deg < 250) return 'Postero-Lateral (Left)';
    if (deg >= 250 && deg <= 290) return 'Left Lateral (Profile)';
    return 'Antero-Lateral (Left Oblique)';
  };

  // Continuous Auto-Spin loop
  useEffect(() => {
    if (!isAutoSpinning || isDragging) return;
    const interval = setInterval(() => {
      setRotationDeg((prev) => (prev + 1.2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoSpinning, isDragging]);

  // Pointer drag event handlers for full 360° orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRot: rotationDeg,
      startTilt: tiltXDeg,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Horizontal drag rotates 360° continuously
    const newRot = (dragStartRef.current.startRot + deltaX * 0.75 + 3600) % 360;
    // Vertical drag tilts slightly (-15° to +15° for anatomical clarity)
    const newTilt = Math.max(-15, Math.min(15, dragStartRef.current.startTilt - deltaY * 0.25));

    setRotationDeg(newRot);
    setTiltXDeg(newTilt);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Quick preset angle setters
  const setPresetAngle = (targetDeg: number) => {
    setIsAutoSpinning(false);
    setRotationDeg(targetDeg);
    setTiltXDeg(0);
  };

  // 3D perspective transformation calculations
  // For front view: relative angle = normalizedAngle <= 90 ? normalizedAngle : normalizedAngle - 360
  // For back view: relative angle = normalizedAngle - 180
  const localAngle = isFrontHemisphere
    ? normalizedAngle <= 90 ? normalizedAngle : normalizedAngle - 360
    : normalizedAngle - 180;

  // Compute dynamic 3D lighting shadow angle based on orbit
  const lightingX = Math.sin((normalizedAngle * Math.PI) / 180) * 15;
  const lightingOpacity = Math.max(0.04, Math.abs(Math.cos((normalizedAngle * Math.PI) / 180)) * 0.12);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#ffffff',
        borderRadius: 20,
        padding: 20,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        width: '100%',
        boxSizing: 'border-box',
        gap: 16,
      }}
    >
      {/* ── Top Header & 360° Orbit Status ────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: 360° Orbit Angle & Anatomical Orientation Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: 12,
              padding: '6px 14px',
            }}
          >
            <RotateCw size={15} className={isAutoSpinning ? 'animate-spin' : ''} style={{ color: '#0f6e6e' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: '#0f6e6e' }}>
                Photorealistic 360° Orbit: {normalizedAngle}°
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                {getOrientationLabel(normalizedAngle)}
              </span>
            </div>
          </div>

          {/* Severity Pill Badge */}
          <span
            style={{
              background: severityColor.bg,
              color: severityColor.text,
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              border: `1px solid ${severityColor.hex}40`,
            }}
          >
            Pain: {severity}/10 · {severityColor.label}
          </span>
        </div>

        {/* Right: Preset Angle Buttons & 360 Orbit Controls */}
        {showControls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {/* Quick 1-Click Anatomical Views */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 3 }}>
              <button
                type="button"
                onClick={() => setPresetAngle(0)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: normalizedAngle === 0 ? '#0f6e6e' : 'transparent',
                  color: normalizedAngle === 0 ? '#ffffff' : '#475569',
                  transition: 'all 120ms',
                }}
              >
                Front (0°)
              </button>

              <button
                type="button"
                onClick={() => setPresetAngle(90)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: normalizedAngle === 90 ? '#0f6e6e' : 'transparent',
                  color: normalizedAngle === 90 ? '#ffffff' : '#475569',
                  transition: 'all 120ms',
                }}
              >
                Right (90°)
              </button>

              <button
                type="button"
                onClick={() => setPresetAngle(180)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: normalizedAngle === 180 ? '#0f6e6e' : 'transparent',
                  color: normalizedAngle === 180 ? '#ffffff' : '#475569',
                  transition: 'all 120ms',
                }}
              >
                Back (180°)
              </button>

              <button
                type="button"
                onClick={() => setPresetAngle(270)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 7,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: normalizedAngle === 270 ? '#0f6e6e' : 'transparent',
                  color: normalizedAngle === 270 ? '#ffffff' : '#475569',
                  transition: 'all 120ms',
                }}
              >
                Left (270°)
              </button>
            </div>

            {/* Auto-Spin 360 Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoSpinning((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 11px',
                borderRadius: 9,
                fontSize: 11.5,
                fontWeight: 700,
                border: '1px solid #cbd5e1',
                background: isAutoSpinning ? '#e0f2fe' : '#ffffff',
                color: isAutoSpinning ? '#0284c7' : '#334155',
                cursor: 'pointer',
                transition: 'all 120ms',
              }}
              title="Continuous 360° rotation"
            >
              {isAutoSpinning ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoSpinning ? 'Pause' : 'Auto 360°'}</span>
            </button>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 2 }}>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(1.4, z + 0.1))}
                style={{ padding: '4px 6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569' }}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(0.8, z - 0.1))}
                style={{ padding: '4px 6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569' }}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main 3D Orbital Photorealistic Stage ─────────────────────────── */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          height: typeof height === 'number' ? height : 440,
          background: 'radial-gradient(circle at 50% 45%, #ffffff 0%, #f0f7f6 65%, #e2efe9 100%)',
          borderRadius: 24,
          border: '1.5px solid #cce8e3',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          boxShadow: 'inset 0 0 35px rgba(15,110,110,0.08), 0 10px 25px -5px rgba(0,0,0,0.05)',
          perspective: '1200px',
        }}
      >
        {/* Holographic Medical HUD Corner Guides */}
        <div style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTop: '2.5px solid #0f6e6e', borderLeft: '2.5px solid #0f6e6e', zIndex: 20, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTop: '2.5px solid #0f6e6e', borderRight: '2.5px solid #0f6e6e', zIndex: 20, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottom: '2.5px solid #0f6e6e', borderLeft: '2.5px solid #0f6e6e', zIndex: 20, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottom: '2.5px solid #0f6e6e', borderRight: '2.5px solid #0f6e6e', zIndex: 20, pointerEvents: 'none' }} />

        {/* 3D Orbit Compass HUD (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(15,110,110,0.2)',
            borderRadius: 20,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 800,
            color: '#0f6e6e',
            pointerEvents: 'none',
          }}
        >
          <Compass size={13} style={{ transform: `rotate(${normalizedAngle}deg)` }} />
          <span>{normalizedAngle}°</span>
        </div>

        {/* 3D Drag-To-Rotate Instruction Hint (Bottom Center) */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: 'none',
            letterSpacing: '0.02em',
          }}
        >
          <RotateCw size={12} />
          <span>Drag horizontally for continuous 360° orbit</span>
        </div>

        {/* 3D Rotating Mannequin Wrapper with 3D Perspective */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${zoomScale}) rotateY(${localAngle}deg) rotateX(${tiltXDeg}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 160ms cubic-bezier(0.2, 0.8, 0.4, 1)',
          }}
        >
          {/* Photorealistic 3D Mannequin Image (Same high-res clinical asset as mobile) */}
          <img
            src={isFrontHemisphere ? '/images/body_3d_front.jpg' : '/images/body_3d_back.jpg'}
            alt={`Photorealistic 3D Mannequin - ${activeHemisphere} view`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              filter: `drop-shadow(${lightingX}px 8px 18px rgba(0,0,0,${lightingOpacity})) contrast(1.04)`,
              pointerEvents: 'none',
            }}
          />

          {/* 3D Rotating Anatomical Hotspots */}
          {ALL_HOTSPOTS.filter((h) => h.hemisphere === activeHemisphere).map((spot) => {
            const isSelected =
              normalizedRegion.toLowerCase() === spot.mappedRegionId.toLowerCase() ||
              activeRegion.toLowerCase() === spot.id.toLowerCase();
            const pinColor = severityColor.hex;

            // Project hotspot horizontal position according to orbital angle for 3D depth
            // Hotspots slightly foreshorten towards edges when rotated
            const angleRad = (localAngle * Math.PI) / 180;
            const cosAngle = Math.cos(angleRad);
            const edgeFade = Math.max(0.2, cosAngle);

            return (
              <div
                key={`${spot.hemisphere}-${spot.id}-${spot.mappedRegionId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRegion(spot.mappedRegionId);
                }}
                style={{
                  position: 'absolute',
                  top: `${spot.top}%`,
                  left: `${spot.left}%`,
                  width: `${spot.width}%`,
                  height: `${spot.height}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: isSelected ? 35 : 15,
                  opacity: edgeFade,
                  transition: 'opacity 150ms ease',
                }}
              >
                {/* Active Pain Hotspot Target */}
                {isSelected ? (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Glowing Animated Pulsating Halo */}
                    <div
                      style={{
                        position: 'absolute',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: pinColor,
                        opacity: 0.35,
                        animation: 'pulse 1.8s ease-in-out infinite',
                      }}
                    />

                    {/* 3D Center Pin Badge with Severity Number */}
                    <div
                      style={{
                        position: 'relative',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: pinColor,
                        border: '2.5px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: 12,
                        boxShadow: `0 0 16px ${pinColor}`,
                        zIndex: 2,
                      }}
                    >
                      {severity}
                    </div>

                    {/* Hotspot Floating Pill Label */}
                    <div
                      style={{
                        position: 'absolute',
                        top: spot.id === 'head' ? 32 : -26,
                        background: '#ffffff',
                        border: `1.5px solid ${pinColor}`,
                        borderRadius: 20,
                        padding: '2px 8px',
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: pinColor,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        zIndex: 3,
                        pointerEvents: 'none',
                      }}
                    >
                      {spot.name}: {severity}/10
                    </div>
                  </div>
                ) : (
                  /* Unselected Interactive Target Dot */
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(15,110,110,0.06)',
                      border: '1px dashed rgba(15,110,110,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 120ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(15,110,110,0.18)';
                      e.currentTarget.style.borderColor = '#0f6e6e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(15,110,110,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(15,110,110,0.3)';
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(15,110,110,0.4)' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Region Selector Chips (Synchronized with visible view) ─── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>
            Quick Select Anatomical Zone ({activeHemisphere === 'front' ? 'Anterior' : 'Posterior'}):
          </span>
          <button
            type="button"
            onClick={() => setPresetAngle(activeHemisphere === 'front' ? 180 : 0)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#0f6e6e',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Orbit to {activeHemisphere === 'front' ? 'Back (180°)' : 'Front (0°)'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALL_HOTSPOTS.filter((h) => h.hemisphere === activeHemisphere).map((spot) => {
            const isSelected =
              normalizedRegion.toLowerCase() === spot.mappedRegionId.toLowerCase() ||
              activeRegion.toLowerCase() === spot.id.toLowerCase();
            return (
              <button
                key={`${spot.hemisphere}-${spot.id}`}
                type="button"
                onClick={() => onSelectRegion(spot.mappedRegionId)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 11px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: isSelected ? 800 : 600,
                  border: isSelected ? `1.5px solid ${severityColor.hex}` : '1px solid #e2e8f0',
                  background: isSelected ? `${severityColor.hex}15` : '#f8fafc',
                  color: isSelected ? severityColor.hex : '#334155',
                  cursor: 'pointer',
                  transition: 'all 120ms',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isSelected ? severityColor.hex : '#94a3b8',
                  }}
                />
                <span>{spot.name}</span>
                {isSelected && <span>({severity}/10)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Severity Legend Bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 14px',
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          fontSize: 11.5,
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          <span>Severe (7-10)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
          <span>Moderate (4-6)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
          <span>Mild (1-3)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
          <span>Normal</span>
        </div>
      </div>

      {/* Pulse Keyframe Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 0.15; }
          100% { transform: scale(1); opacity: 0.4; }
        }
      `}} />
    </div>
  );
}

