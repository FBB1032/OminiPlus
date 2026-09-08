'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Monitor, Download, ShieldCheck, ArrowLeft, CheckCircle2,
  Lock, Smartphone, ArrowRight, Laptop, Sparkles, ExternalLink, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type OSType = 'windows' | 'mac' | 'linux';

interface OSConfig {
  id: OSType;
  name: string;
  file: string;
  badge: string;
  label: string;
  shortName: string;
  arch: string;
  size: string;
  icon: typeof Monitor;
}

const OS_CONFIGS: Record<OSType, OSConfig> = {
  windows: {
    id: 'windows',
    name: 'Windows',
    file: 'OminiPulse-Setup-2.2.0.exe',
    badge: 'Windows 10 & 11 (64-bit)',
    label: 'Download OminiPulse for Windows (.exe)',
    shortName: 'Windows (.exe)',
    arch: 'x64 / ARM64 Windows Installer',
    size: '84.2 MB',
    icon: Monitor,
  },
  mac: {
    id: 'mac',
    name: 'macOS',
    file: 'OminiPulse-2.2.0.dmg',
    badge: 'macOS 12+ (Universal)',
    label: 'Download OminiPulse for macOS (.dmg)',
    shortName: 'macOS (.dmg)',
    arch: 'Apple Silicon (M1–M4) & Intel',
    size: '88.7 MB',
    icon: Laptop,
  },
  linux: {
    id: 'linux',
    name: 'Linux',
    file: 'OminiPulse-2.2.0.AppImage',
    badge: 'Universal AppImage & Debian',
    label: 'Download OminiPulse for Linux (.AppImage)',
    shortName: 'Linux (.AppImage)',
    arch: 'Ubuntu, Debian, Fedora (x86_64)',
    size: '91.5 MB',
    icon: Monitor,
  },
};

export default function PublicWebLoginGatePage() {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  const [selectedOS, setSelectedOS] = useState<OSType>('windows');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const osParam = params.get('os')?.toLowerCase();

      if (osParam === 'mac' || osParam === 'macos' || osParam === 'darwin') {
        setSelectedOS('mac');
        return;
      }
      if (osParam === 'linux') {
        setSelectedOS('linux');
        return;
      }
      if (osParam === 'windows' || osParam === 'win') {
        setSelectedOS('windows');
        return;
      }

      // Auto-detect from user agent if no query param
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('mac')) setSelectedOS('mac');
      else if (ua.includes('linux')) setSelectedOS('linux');
      else setSelectedOS('windows');
    }
  }, []);

  const switchOS = (os: OSType) => {
    setSelectedOS(os);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('os', os);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleDownload = (platform: string, filename: string) => {
    setDownloadStarted(platform);
    // Trigger simulated native installer download
    const link = document.createElement('a');
    link.href = `https://github.com/FBB1032/OminiPlus/releases/download/v2.2.0/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    // Fallback notification
    setTimeout(() => {
      alert(`OminiPulse Desktop App (${platform}) installer download initiated: ${filename}\n\nOnce installed, launch the application to sign into your Doctor, Hospital, or Admin workspace.`);
      setDownloadStarted(null);
    }, 400);
  };

  const currentOS = OS_CONFIGS[selectedOS];
  const otherOSes = (['windows', 'mac', 'linux'] as const).filter((os) => os !== selectedOS);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdfa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0f172a'
    }}>

      {/* Top Header Link back to Home */}
      <div style={{ position: 'absolute', top: 24, left: 32 }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#64748b',
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <ArrowLeft size={16} /> Back to Public Website
        </Link>
      </div>

      {/* Center Gate Card */}
      <div style={{
        maxWidth: 580,
        width: '100%',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 24,
        padding: '44px 38px',
        boxShadow: '0 20px 45px rgba(15,110,110,0.08), 0 4px 16px rgba(0,0,0,0.02)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22
      }}>

        {/* Brand Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="OminiPulse"
            width={180}
            height={50}
            style={{ height: 46, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* Animated Desktop Graphic Icon */}
        <div style={{
          position: 'relative',
          width: 90,
          height: 90,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #e6f4f4 0%, #ccfbf1 100%)',
          color: '#0f6e6e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #99f6e4',
          boxShadow: '0 10px 25px rgba(15,110,110,0.18)'
        }}>
          <Monitor size={46} strokeWidth={1.8} />
          <span style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#0f6e6e',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            border: '2px solid #ffffff'
          }}>
            <Lock size={13} />
          </span>
        </div>

        {/* Title & Core Requirement Message */}
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            margin: '0 0 10px'
          }}>
            OminiPulse Desktop App Required
          </h1>
          <p style={{
            fontSize: 14.5,
            color: '#475569',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: 480
          }}>
            Doctor, Hospital, and Admin accounts are managed through the <strong>OminiPulse Desktop App</strong>.
            Download the desktop application to continue.
          </p>
        </div>

        {/* OS Selector Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          gap: 4,
          border: '1px solid #e2e8f0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {(['windows', 'mac', 'linux'] as const).map((osKey) => {
            const cfg = OS_CONFIGS[osKey];
            const isSelected = selectedOS === osKey;
            return (
              <button
                key={osKey}
                type="button"
                onClick={() => switchOS(osKey)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: isSelected ? '1px solid #cbd5e1' : '1px solid transparent',
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#0f172a' : '#64748b',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 150ms ease'
                }}
              >
                {osKey === 'mac' ? <Laptop size={14} /> : <Monitor size={14} />}
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Download CTA Button (Dynamically updates to selected OS) */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => handleDownload(currentOS.name, currentOS.file)}
            disabled={downloadStarted !== null}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: currentOS.id === 'mac'
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : currentOS.id === 'linux'
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                : 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '16px 20px',
              fontSize: 15.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(15,23,42,0.16)',
              transition: 'transform 120ms ease, background 200ms ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Download size={19} />
              <span>{currentOS.label}</span>
            </div>
            <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>
              {currentOS.badge} · {currentOS.size} · Official Release
            </span>
          </button>

          {/* Dynamic "Also available for" with clickable OS switchers */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 12.5,
            color: '#64748b',
            marginTop: 4,
            flexWrap: 'wrap'
          }}>
            <span>Also available for:</span>
            {otherOSes.map((osKey, idx) => {
              const cfg = OS_CONFIGS[osKey];
              return (
                <span key={osKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => switchOS(osKey)}
                    title={`Switch download to ${cfg.name}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0f6e6e',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 12.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'underline'
                    }}
                  >
                    {osKey === 'mac' ? <Laptop size={13} /> : <Monitor size={13} />}
                    <span>{cfg.shortName}</span>
                  </button>
                  {idx < otherOSes.length - 1 && <span style={{ color: '#cbd5e1' }}>•</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights of the Desktop App */}
        <div style={{
          width: '100%',
          background: '#f8fafc',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px' }}>
            Why use the Desktop Application?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} color="#059669" />
              <span>Full Inpatient Bed Matrix</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} color="#059669" />
              <span>MDCN Digital Rx Signing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} color="#059669" />
              <span>HD Video Telehealth Station</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={15} color="#059669" />
              <span>Encrypted NDPA Vault</span>
            </div>
          </div>
        </div>

        {/* Patient Mobile App Callout */}
        <div style={{
          width: '100%',
          borderTop: '1px solid #e2e8f0',
          paddingTop: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smartphone size={14} color="#0f6e6e" /> Are you a Patient?
            </span>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>
              Book appointments and talk to doctors via the Mobile App
            </span>
          </div>

          <Link
            href="/#mobile-apps"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#0f6e6e',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            Get Mobile App <ArrowRight size={13} />
          </Link>
        </div>

      </div>

      {/* Footer Security Badges */}
      <div style={{
        marginTop: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 12,
        color: '#64748b'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={14} color="#0f6e6e" /> MDCN Certified Guidelines
        </span>
        <span>•</span>
        <span>NDPA 2023 Compliant</span>
        <span>•</span>
        <span>Version 2.2.0</span>
      </div>

    </div>
  );
}
