'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Stethoscope, Building2, Smartphone, Monitor, Shield,
  ArrowRight, Download, CheckCircle2, X, Phone,
  Mail, Users, Heart, Activity, Droplet, Star, Clock,
  FileText, AlertCircle, Laptop
} from 'lucide-react';

type RoleModalType = 'select' | 'patient' | 'doctor' | 'hospital' | 'nurse' | null;

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<RoleModalType>(null);
  const [downloadAppModal, setDownloadAppModal] = useState<{ appName: string; store: 'Google Play' | 'App Store' } | null>(null);

  const openOnboarding = () => setActiveModal('select');
  const closeModal = () => setActiveModal(null);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 76,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Brand Logo - Bigger, Transparent, No Background */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', background: 'transparent' }}>
            <Image
              src="/logo.png"
              alt="OminiPulse"
              width={180}
              height={56}
              style={{ height: 50, width: 'auto', objectFit: 'contain', background: 'transparent' }}
              priority
            />
          </Link>

          {/* Center Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hidden md:flex">
            <a href="#about" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              About
            </a>
            <a href="#how-it-works" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              How It Works
            </a>
            <a href="#for-doctors" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              For Doctors
            </a>
            <a href="#hospitals" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              For Hospitals
            </a>
            <a href="#downloads" style={{ fontSize: 13, fontWeight: 700, color: '#0f6e6e', textDecoration: 'none', transition: 'color 150ms' }}>
              Downloads
            </a>
            <a href="#faqs" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              FAQs
            </a>
            <a href="#contact" style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 150ms' }}>
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/login"
              style={{
                fontSize: 13, fontWeight: 600, color: '#0f6e6e',
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                border: '1px solid #ccfbf1', background: '#f0fdfa',
                transition: 'all 150ms'
              }}
            >
              Sign In
            </Link>

            <a
              href="#downloads"
              style={{
                fontSize: 13, fontWeight: 700, color: '#ffffff',
                padding: '8px 18px', borderRadius: 8, textDecoration: 'none',
                border: 'none', background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 10px rgba(15,110,110,0.3)',
                transition: 'transform 150ms'
              }}
            >
              Download Desktop App <Download size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 0%, #eff6ff 0%, #ffffff 70%)',
        padding: '64px 24px 76px',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* Main Hero Header */}
          <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 28px' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800,
              lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.03em', margin: 0
            }}>
              Connecting Patients, Doctors & Hospitals in One Living Pulse
            </h1>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: '#475569',
              lineHeight: 1.6, marginTop: 18, marginBottom: 0
            }}>
              OminiPulse brings verified hospitals, specialist doctors, clinical triage, and mobile patient care together into an integrated ecosystem.
            </p>
          </div>

          {/* CTA Buttons with App Store Badges */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 14, flexWrap: 'wrap', marginBottom: 40
          }}>
            <a
              href="#downloads"
              style={{
                background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
                color: '#ffffff', border: 'none', padding: '14px 28px',
                borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(15,110,110,0.35)'
              }}
            >
              <Monitor size={18} /> Download Desktop App (Doctors & Hospitals)
            </a>

            <Link
              href="/login"
              style={{
                background: '#ffffff', color: '#0f172a',
                border: '1.5px solid #cbd5e1', padding: '14px 26px',
                borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              Doctor & Hospital Login <ArrowRight size={15} />
            </Link>
          </div>

          {/* Quick App Store / Play Store Download Strip */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, flexWrap: 'wrap', marginBottom: 50
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
              Patient & Doctor App Available On:
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Google Play Button */}
              <button
                onClick={() => setActiveModal('patient')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#0f172a', color: '#ffffff', padding: '8px 16px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-.954V2.768c0-.36.21-.692.61-.954zm11.233 11.234l2.585 2.585-12.247 6.942 9.662-9.527zm0-2.096L5.18 1.425l12.247 6.942-2.585 2.585zm1.485 1.048l3.655 2.073c.96.544.96 1.43 0 1.974l-3.655 2.073-2.228-2.228 2.228-1.892z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>GET IT ON</span>
                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Google Play</span>
                </div>
              </button>

              {/* App Store Button */}
              <button
                onClick={() => setActiveModal('patient')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#0f172a', color: '#ffffff', padding: '8px 16px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.77-.97 2.83 1.07.08 2.15-.52 2.76-1.25" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>Download on the</span>
                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>App Store</span>
                </div>
              </button>
            </div>
          </div>

          {/* Hero Visual Collage using Real Images */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20, maxWidth: 1120, margin: '0 auto'
          }}>
            {/* 1. Patient Card */}
            <div style={{
              background: '#ffffff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ height: 210, position: 'relative', background: '#f1f5f9' }}>
                <Image
                  src="/images/role_patient.jpg"
                  alt="OminiPulse Patient Mobile Care"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)',
                  color: '#ffffff', padding: '4px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Smartphone size={13} style={{ color: '#38bdf8' }} /> PHONE ONLY
                </div>
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    Patient Experience
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    Patients access appointment bookings, lab results, telemedicine, and emergency blood appeals <strong>strictly via the mobile app</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('patient')}
                  style={{
                    marginTop: 16, width: '100%', padding: '9px',
                    borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
                    fontSize: 12.5, fontWeight: 600, color: '#2563eb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Download App to Create Account <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 2. Doctor Card */}
            <div style={{
              background: '#ffffff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #bfdbfe', boxShadow: '0 10px 30px rgba(37,99,235,0.08)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ height: 210, position: 'relative', background: '#f1f5f9' }}>
                <Image
                  src="/images/role_doctor.jpg"
                  alt="OminiPulse Verified Doctors"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(37, 99, 235, 0.9)', backdropFilter: 'blur(6px)',
                  color: '#ffffff', padding: '4px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Monitor size={13} /> AVAILABLE ON DESKTOP & MOBILE
                </div>
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    Doctor Clinical Practice
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    Doctors operate on <strong>Mobile and Desktop</strong>. Mobile for consultations on the go; native Desktop App for deep SOAP notes, e-prescriptions, and MDCN compliance.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('doctor')}
                  style={{
                    marginTop: 16, width: '100%', padding: '9px',
                    borderRadius: 8, background: '#2563eb', border: 'none',
                    fontSize: 12.5, fontWeight: 600, color: '#ffffff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Doctor Onboarding Details <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 3. Hospital & Staff Card */}
            <div style={{
              background: '#ffffff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ height: 210, position: 'relative', background: '#f1f5f9' }}>
                <Image
                  src="/images/medical_team.jpg"
                  alt="OminiPulse Hospital Facility"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)',
                  color: '#ffffff', padding: '4px 10px', borderRadius: 20,
                  fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Monitor size={13} style={{ color: '#34d399' }} /> AVAILABLE ON DESKTOP ONLY
                </div>
              </div>
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                    Hospitals, Nurses & Staff
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    Facility management, nurse triage, reception intake, and blood banks operate <strong>exclusively on the OminiPulse Desktop App</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => setActiveModal('hospital')}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 8,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer'
                    }}
                  >
                    Hospital
                  </button>
                  <button
                    onClick={() => setActiveModal('nurse')}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 8,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      fontSize: 12, fontWeight: 600, color: '#0f172a', cursor: 'pointer'
                    }}
                  >
                    Nurse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS OMINIPULSE & TARGET AUDIENCE ─────────────────────── */}
      <section id="about" style={{ padding: '80px 24px 70px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          
          {/* Section 1: What is OminiPulse? */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 24, padding: '48px 40px', color: '#ffffff',
            position: 'relative', overflow: 'hidden', marginBottom: 64,
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.2)'
          }}>
            <div style={{ maxWidth: 780, position: 'relative', zIndex: 2 }}>
              <span style={{
                display: 'inline-block', background: 'rgba(37,99,235,0.25)',
                color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)',
                fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16
              }}>
                Platform Overview
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                What is OminiPulse?
              </h2>
              <p style={{ fontSize: 16, color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 20px' }}>
                <strong>OminiPulse is a synchronized digital healthcare operating ecosystem</strong> that unites patients, licensed medical doctors, and accredited hospital facilities into one interconnected clinical network.
              </p>
              <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
                Traditional healthcare is plagued by fragmented patient records, delayed emergency blood appeals, unverified practitioners, and long hospital queues. OminiPulse eliminates these bottlenecks by connecting mobile patient care directly with verified clinical workstations and enterprise hospital management in real time.
              </p>
            </div>

            {/* 3 Core Value Pillars */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24, marginTop: 36, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                  <Heart size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Integrated Patient Care</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    Instant doctor booking, private digital health records, and emergency blood appeals right on their mobile device.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Doctor Clinical Practice</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    Full flexibility: conduct telemedicine on mobile, and manage deep SOAP notes, prescriptions, and duty shifts on the desktop app.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Hospital Facility Suite</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                    Staff credentialing, nurse triage, reception intake, bed occupancy, and verified blood donor screening in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── UNIFIED ROLES & TRANSPARENT PRICING MODEL ──────────────── */}
      <section id="roles-pricing" style={{ padding: '80px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 48px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Roles & Transparent Pricing
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, color: '#0f172a', marginTop: 8, letterSpacing: '-0.02em' }}>
              Where Each Role Operates & How Pricing Works
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', marginTop: 10, lineHeight: 1.6 }}>
              OminiPulse is built with an open, transparent model. Patients and doctors join for free, doctors control their own rates, and institutional facility setups are custom-quoted.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(265px, 1fr))', gap: 24
          }}>
            {/* 1. Patient Card */}
            <div style={{
              background: '#ffffff', borderRadius: 20, padding: '28px 24px',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      PHONE ONLY
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 6 }}>
                      100% FREE APP
                    </span>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Patients
                </h3>
                
                {/* Price Display */}
                <div style={{ margin: '12px 0 16px', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                    Free Account
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    Only pay doctor consultation fee when booking
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  The app is completely free to download and use. There are zero subscription charges or signup costs. <strong>You only pay when you choose to book a medical consultation</strong> with a verified doctor.
                </p>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#64748b', lineHeight: 1.75 }}>
                  <li>Free iOS & Android mobile app download</li>
                  <li>Free encrypted health records & vitals</li>
                  <li>Free AI symptom triage checks</li>
                  <li>Only pay doctor&apos;s published fee per visit</li>
                  <li>Free emergency blood donor appeal broadcast</li>
                </ul>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setActiveModal('patient')}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    fontSize: 13, fontWeight: 700, color: '#2563eb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Download Free App &rarr;
                </button>
              </div>
            </div>

            {/* 2. Doctor Card */}
            <div style={{
              background: '#ffffff', borderRadius: 20, padding: '28px 24px',
              border: '2px solid #93c5fd', boxShadow: '0 8px 25px rgba(37,99,235,0.08)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      AVAILABLE ON DESKTOP & MOBILE
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6 }}>
                      FREE REGISTRATION
                    </span>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Doctors
                </h3>

                {/* Price Display */}
                <div style={{ margin: '12px 0 16px', padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af' }}>
                    Set Your Own Fee
                  </div>
                  <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
                    OminiPulse retains a small platform %
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Registration and clinical practice tools are completely free for verified physicians. <strong>You have total freedom to set your own consultation rates</strong>. OminiPulse retains a modest service percentage per completed consultation.
                </p>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#64748b', lineHeight: 1.75 }}>
                  <li>Free MDCN verification & profile setup</li>
                  <li>Total autonomy to set consultation pricing</li>
                  <li>OminiPulse platform percentage deducted automatically</li>
                  <li>Available on Desktop & Synchronized with Mobile App</li>
                  <li>Direct automated earnings payouts to your bank</li>
                </ul>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setActiveModal('doctor')}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    background: '#2563eb', border: 'none',
                    fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Doctor Registration &rarr;
                </button>
              </div>
            </div>

            {/* 3. Hospital Facility Card */}
            <div style={{
              background: '#ffffff', borderRadius: 20, padding: '28px 24px',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      AVAILABLE ON DESKTOP
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6 }}>
                      CUSTOM QUOTE
                    </span>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Hospitals & Clinics
                </h3>

                {/* Price Display */}
                <div style={{ margin: '12px 0 16px', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                    Undisclosed Pricing
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    Contact OminiPulse for institutional pricing
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Hospital enterprise pricing is undisclosed and structured according to your facility scale, bed capacity, number of medical staff accounts, and branch network. <strong>Contact our team for a tailored quote</strong>.
                </p>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#64748b', lineHeight: 1.75 }}>
                  <li>Custom facility deployment & profile configuration</li>
                  <li>Issue staff credentials (doctors, nurses, receptionists)</li>
                  <li>Safe blood bank transfusion & donor screening</li>
                  <li>Emergency transfer network with nearby facilities</li>
                  <li>Contact: partnerships@ominipulse.ai / +234 800 OMINI PULSE</li>
                </ul>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setActiveModal('hospital')}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    background: '#0f172a', border: 'none',
                    fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  Contact for Facility Pricing &rarr;
                </button>
              </div>
            </div>

            {/* 4. Nurses & Hospital Staff Card */}
            <div style={{
              background: '#ffffff', borderRadius: 20, padding: '28px 24px',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#fef2f2', color: '#b91c1c', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                      AVAILABLE ON DESKTOP
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 750, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 6 }}>
                      FREE FOR STAFF
                    </span>
                  </div>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Nurses & Staff
                </h3>

                {/* Price Display */}
                <div style={{ margin: '12px 0 16px', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                    Included with Facility
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    Issued by your Hospital Administrator
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Individual nurses, receptionists, and blood officers never pay for software access. <strong>Your credentials and role permissions are provisioned directly by your hospital</strong> at zero cost to staff members.
                </p>

                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#64748b', lineHeight: 1.75 }}>
                  <li>100% free account access for hospital staff</li>
                  <li><strong>Nurses:</strong> Inpatient vitals, bed management & triage</li>
                  <li><strong>Receptionists:</strong> Patient check-in & arrivals flow</li>
                  <li><strong>Blood Officers:</strong> Blood units & donor visits</li>
                  <li>Credentials issued by your Medical Director</li>
                </ul>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <Link
                  href="/login"
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    background: '#f8fafc', border: '1px solid #cbd5e1',
                    fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxSizing: 'border-box'
                  }}
                >
                  Staff Portal Login &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Apps Download Spotlight with Reviews on the Side ── */}
      <section id="apps" style={{ padding: '80px 24px', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ maxWidth: 1260, margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: 36
          }}>
            
            {/* 1. Left Column: App Copy & Download Buttons */}
            <div>
              <span style={{
                display: 'inline-block', background: 'rgba(37,99,235,0.2)',
                color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)',
                fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14
              }}>
                Direct Mobile Access
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                Download OminiPulse on iOS & Android
              </h2>
              <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px' }}>
                Are you a patient seeking medical care, or a licensed doctor managing remote patients? The OminiPulse mobile app puts end-to-end clinical communications and secure health records directly in your hands.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: '#e2e8f0' }}>
                    <strong>Patients:</strong> Appointments, AI triage, prescriptions & blood appeals.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: '#e2e8f0' }}>
                    <strong>Doctors:</strong> Video consultations, patient chat & mobile triage.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: '#e2e8f0' }}>
                    <strong>Security:</strong> Biometric login & HIPAA/NDPR-compliant data safety.
                  </span>
                </div>
              </div>

              {/* Store Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
                <button
                  onClick={() => setActiveModal('patient')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#ffffff', color: '#0f172a', padding: '10px 18px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-.954V2.768c0-.36.21-.692.61-.954zm11.233 11.234l2.585 2.585-12.247 6.942 9.662-9.527zm0-2.096L5.18 1.425l12.247 6.942-2.585 2.585zm1.485 1.048l3.655 2.073c.96.544.96 1.43 0 1.974l-3.655 2.073-2.228-2.228 2.228-1.892z" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#64748b', lineHeight: 1 }}>GET IT ON</span>
                    <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Google Play</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveModal('patient')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#ffffff', color: '#0f172a', padding: '10px 18px',
                    borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.77-.97 2.83 1.07.08 2.15-.52 2.76-1.25" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#64748b', lineHeight: 1 }}>Download on the</span>
                    <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>App Store</span>
                  </div>
                </button>
              </div>

              {/* Rating Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', color: '#f59e0b', gap: 2 }}>
                  <Star size={14} fill="#f59e0b" />
                  <Star size={14} fill="#f59e0b" />
                  <Star size={14} fill="#f59e0b" />
                  <Star size={14} fill="#f59e0b" />
                  <Star size={14} fill="#f59e0b" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 750, color: '#ffffff' }}>4.9/5 Rating</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>• 2,800+ Store Reviews</span>
              </div>
            </div>

            {/* 2. Center Column: Phone Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 280, height: 440, borderRadius: 36,
                background: '#1e293b', border: '5px solid #334155',
                overflow: 'hidden', position: 'relative',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)'
              }}>
                <Image
                  src="/images/onboarding_doctor_1.png"
                  alt="OminiPulse Mobile App"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* 3. Right Column: Reviews on the side! */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 750, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={15} fill="#f59e0b" style={{ color: '#f59e0b' }} /> Store Reviews
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '2px 8px', borderRadius: 12, border: '1px solid rgba(56,189,248,0.25)' }}>
                  App Store & Google Play
                </span>
              </div>

              {/* Review 1: Patient */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', color: '#f59e0b', gap: 2 }}>
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                  </div>
                  <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>Google Play</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  &ldquo;Booking a doctor usually meant waiting 4 hours in the clinic lobby. On OminiPulse, I did an AI triage and got connected with a verified pediatrician in 10 minutes.&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                    CO
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Chinedu Okafor</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>• Patient (Lagos)</span>
                </div>
              </div>

              {/* Review 2: Doctor */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', color: '#f59e0b', gap: 2 }}>
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                  </div>
                  <span style={{ fontSize: 10.5, color: '#60a5fa', fontWeight: 600 }}>App Store</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  &ldquo;The mobile and desktop sync is seamless. Fast video follow-ups on my iPhone between hospital rounds, then SOAP documentation and lab orders on the desktop app.&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                    FA
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Dr. Folake Adeyemi, MD</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>• Doctor (Abuja)</span>
                </div>
              </div>

              {/* Review 3: Emergency Blood Coordinator */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', color: '#f59e0b', gap: 2 }}>
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                    <Star size={12} fill="#f59e0b" />
                  </div>
                  <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>Google Play</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, fontStyle: 'italic' }}>
                  &ldquo;When emergency surgery required 2 units of O-negative blood, our clinic broadcast an urgent appeal on OminiPulse. A screened donor arrived in 40 minutes.&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#ffffff' }}>
                    BM
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>Bello Mohammed</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>• Emergency Care (Kano)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Hospital Facility Section ───────────────────────────────── */}
      <section id="hospitals" style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
            borderRadius: 20, padding: '48px 36px', border: '1px solid #bfdbfe',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'center', gap: 36
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Hospitals & Medical Centers
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '8px 0 14px', letterSpacing: '-0.02em' }}>
                Partner Your Healthcare Facility with OminiPulse
              </h2>
              <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
                Transform your hospital operations with role-based staff management, blood shortage appeals, inpatient triage, and safe patient record access.
              </p>
              
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveModal('hospital')}
                  style={{
                    padding: '12px 24px', background: '#2563eb', color: '#ffffff',
                    borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}
                >
                  Contact OminiPulse to Onboard <ArrowRight size={15} />
                </button>
                <Link
                  href="/login"
                  style={{
                    padding: '12px 20px', background: '#ffffff', color: '#0f172a',
                    borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Hospital Admin Sign In
                </Link>
              </div>
            </div>

            <div style={{
              background: '#ffffff', padding: 24, borderRadius: 14,
              border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                Included with Hospital Facility Onboarding:
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
                <li>Dedicated Hospital Portal workspace with facility name display</li>
                <li>Staff roster management: issue nurse, doctor & receptionist accounts</li>
                <li>Safe Blood Transfusion pipeline with screening booking system</li>
                <li>Facility profile, service catalog, and operational audit logs</li>
                <li>Controlled emergency operations & inter-facility patient transfer</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: How OminiPulse Works ────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <span style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#0f6e6e', background: '#e6f4f4', padding: '4px 12px', borderRadius: 999,
              display: 'inline-block', marginBottom: 12
            }}>
              Integrated 3-Tier Healthcare Architecture
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              How OminiPulse Works
            </h2>
            <p style={{ fontSize: 15, color: '#475569', marginTop: 12, lineHeight: 1.6 }}>
              A closed-loop digital ecosystem connecting patients on mobile with certified doctors and multi-department hospitals on native desktop workstations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Pillar 1: Patient Mobile App */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 26px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={26} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>1. Patient Mobile App</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>100% Free Triage & Consultations</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Patients explore the 3D Anatomical Body Map to pinpoint pain locations, match with top verified specialists, attend encrypted video consults, and receive digital prescriptions.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Android & iOS Mobile App</span>
              </div>
            </div>

            {/* Pillar 2: Doctor Desktop App */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 26px', border: '1.5px solid #ccfbf1',
              display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 20px rgba(15,110,110,0.08)'
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: '#e6f4f4', color: '#0f6e6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={26} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f6e6e', textTransform: 'uppercase' }}>2. Doctor Desktop Application</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Autonomous Clinical Practice</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Licensed doctors operate their teleconsultation clinic on the OminiPulse Desktop App: manage patient queues, inspect EHRs, write e-prescriptions, and earn with custom fee settings.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f6e6e' }}>Windows · macOS · Linux Desktop</span>
              </div>
            </div>

            {/* Pillar 3: Hospital Operating System */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 26px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={26} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>3. Hospital Desktop Operating System</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Multi-Department Telemetry</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Hospital administrators, nurses, and lab techs coordinate real-time inpatient ward beds, dispensary stock, diagnostic specimen processing, and blood bank transfusions.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>Enterprise Institutional Tier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: For Doctors ───────────────────────────────────────── */}
      <section id="for-doctors" style={{ padding: '80px 24px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#0f6e6e', background: '#e6f4f4', padding: '4px 12px', borderRadius: 999,
              display: 'inline-block', marginBottom: 12
            }}>
              Independent Clinical Practice
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Empowering Certified Physicians Across Africa
            </h2>
            <p style={{ fontSize: 15, color: '#475569', marginTop: 14, lineHeight: 1.6 }}>
              Onboard your medical practice in minutes. Set your own consultation rates, manage your digital patient schedule, and conduct encrypted video consultations directly within the dedicated desktop suite.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              {[
                { title: 'Autonomous Fee Setting', desc: 'Charge your own consultation rate (₦8,000 - ₦25,000+). 90% net earnings payout hold.' },
                { title: 'MDCN Certified Standing', desc: 'Folio license verification locks unverified accounts to protect professional standards.' },
                { title: 'Cryptographic E-Prescriptions', desc: 'Issue digital prescriptions with automated drug allergy and interaction safety checks.' },
                { title: '3D Anatomical Body Map', desc: 'Inspect patient-reported pain zones and intensity levels prior to consultations.' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={18} color="#0f6e6e" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.title}</h4>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <a
                href="#downloads"
                style={{
                  background: 'linear-gradient(135deg, #0f6e6e 0%, #0d9488 100%)',
                  color: '#ffffff', padding: '12px 24px', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(15,110,110,0.3)'
                }}
              >
                <Download size={16} /> Download Desktop App for Doctors
              </a>
            </div>
          </div>

          {/* Doctor Desktop Feature Card */}
          <div style={{
            background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 20,
            padding: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0f6e6e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                FA
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Dr. Folake Ademola</h4>
                <p style={{ fontSize: 12, color: '#0f6e6e', fontWeight: 600, margin: '2px 0 0' }}>MDCN Verified Specialist</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0f6e6e', textTransform: 'uppercase' }}>UP NEXT IN DESKTOP SCHEDULE</span>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', margin: '4px 0 2px' }}>Tunde Afolabi (48y · Male)</p>
              <span style={{ fontSize: 12, color: '#64748b' }}>Reason: Cardiac risk evaluation & lipid profile review</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Chat</span>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>₦8,000</strong>
              </div>
              <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Voice</span>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>₦10,000</strong>
              </div>
              <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>HD Video</span>
                <strong style={{ fontSize: 13, color: '#0f6e6e' }}>₦15,000</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Downloads & Get Started ───────────────────────────── */}
      <section id="downloads" style={{ padding: '80px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 48px' }}>
            <span style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#0f6e6e', background: '#e6f4f4', padding: '4px 12px', borderRadius: 999,
              display: 'inline-block', marginBottom: 12
            }}>
              Download Center
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Download OminiPulse for Desktop & Mobile
            </h2>
            <p style={{ fontSize: 15, color: '#475569', marginTop: 12, lineHeight: 1.6 }}>
              Doctor, Hospital, and Admin clinical operations are managed through the <strong>OminiPulse Desktop Application</strong>. Patient services are accessed via mobile.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {/* Card 1: Windows */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 24px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor size={24} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 6 }}>
                  Recommended
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Windows Desktop App</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Windows 10 & 11 (64-bit) · Installer & Portable
                </p>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                <li>Full Doctor & Hospital clinical suite</li>
                <li>MDCN digital prescription signing</li>
                <li>WebRTC HD teleconsultation station</li>
              </ul>

              <a
                href="/login?os=windows"
                style={{
                  marginTop: 'auto', background: '#0f6e6e', color: '#ffffff', padding: '12px',
                  borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Download size={16} /> Download for Windows (.exe)
              </a>
            </div>

            {/* Card 2: macOS */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 24px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                <Laptop size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>macOS Desktop App</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Apple Silicon (M1/M2/M3/M4) & Intel Mac
                </p>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                <li>Native macOS menu bar integration</li>
                <li>Touch ID secure clinical login</li>
                <li>Retina display optimized body maps</li>
              </ul>

              <a
                href="/login?os=mac"
                style={{
                  marginTop: 'auto', background: '#0f172a', color: '#ffffff', padding: '12px',
                  borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Download size={16} /> Download for macOS (.dmg)
              </a>
            </div>

            {/* Card 3: Linux */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 24px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Linux Desktop App</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Ubuntu, Debian, Fedora (.AppImage / .deb)
                </p>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                <li>Universal portable AppImage bundle</li>
                <li>Debian packaging for hospital workstations</li>
                <li>Low resource footprint execution</li>
              </ul>

              <a
                href="/login?os=linux"
                style={{
                  marginTop: 'auto', background: '#334155', color: '#ffffff', padding: '12px',
                  borderRadius: 10, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Download size={16} /> Download for Linux (.AppImage)
              </a>
            </div>

            {/* Card 4: Mobile App */}
            <div style={{
              background: '#ffffff', borderRadius: 16, padding: '30px 24px', border: '1.5px solid #e2e8f0',
              display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#e6f4f4', color: '#0f6e6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>Patient Mobile App</h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                  Android (Google Play) & iOS (App Store)
                </p>
              </div>

              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#64748b', lineHeight: 1.7 }}>
                <li>3D Body Map symptom triage</li>
                <li>Doctor appointments & telemedicine</li>
                <li>Emergency blood donor network</li>
              </ul>

              <button
                type="button"
                onClick={() => setActiveModal('patient')}
                style={{
                  marginTop: 'auto', background: '#059669', color: '#ffffff', padding: '12px',
                  borderRadius: 10, fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <Download size={16} /> Get Mobile App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Frequently Asked Questions (FAQs) ──────────────────── */}
      <section id="faqs" style={{ padding: '80px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{
              fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#0f6e6e', background: '#e6f4f4', padding: '4px 12px', borderRadius: 999,
              display: 'inline-block', marginBottom: 12
            }}>
              Platform FAQs
            </span>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: 'Why are Doctor, Hospital, and Admin accounts accessed via the Desktop App rather than the web browser?',
                a: 'Clinical workflows require certified NDPA 2023 compliance, encrypted local biometric vaults, hardware WebRTC high-definition medical camera streams, and cryptographic MDCN prescription signing. A native desktop environment eliminates browser extension security vulnerabilities and provides high-speed multi-department operational stability.'
              },
              {
                q: 'How do verified doctors earn and receive consultation payments?',
                a: 'Each doctor sets their own tiered consultation fees (Chat, Voice, and HD Video) inside the desktop application. Patient payments are securely held in clinical escrow until consultation completion. Upon sign-off, 90% net earnings are immediately disbursed to the doctor account.'
              },
              {
                q: 'How do hospitals onboard departments, beds, and staff?',
                a: 'Hospitals contact the OminiPulse Institutional Desk (partnerships@ominipulse.ai) to configure their licensed bed count and departmental modules. The hospital administrator then issues role-specific staff credentials for Wards, Pharmacy, Laboratory, and Receptionist desks.'
              },
              {
                q: 'How do patients book appointments with specialists?',
                a: 'Patients download the 100% free OminiPulse Mobile App on Google Play or the Apple App Store. Account creation is free, and patients only pay the set consultation fee when booking a session with their chosen verified physician.'
              },
              {
                q: 'What are the system requirements for the OminiPulse Desktop App?',
                a: 'The desktop suite runs smoothly on Windows 10/11 (64-bit), macOS 11+ (Intel & Apple Silicon), and major Linux distributions (Ubuntu, Debian, Fedora) with at least 4GB of RAM and an active internet connection.'
              }
            ].map((faq, idx) => (
              <div key={idx} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px'
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  {faq.q}
                </h4>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ─────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '60px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            Have Inquiries About OminiPulse?
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748b', margin: '0 0 28px' }}>
            Contact our health systems team for hospital partnerships, doctor verification inquiries, or platform assistance.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <a
              href="mailto:partnerships@ominipulse.ai"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0',
                color: '#0f172a', textDecoration: 'none', fontSize: 13.5, fontWeight: 600
              }}
            >
              <Mail size={16} style={{ color: '#2563eb' }} /> partnerships@ominipulse.ai
            </a>
            <a
              href="tel:+2348006646478"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0',
                color: '#0f172a', textDecoration: 'none', fontSize: 13.5, fontWeight: 600
              }}
            >
              <Phone size={16} style={{ color: '#16a34a' }} /> +234 800 OMINI PULSE
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '40px 24px 30px' }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 20
        }}>
          {/* Bigger Logo in Footer */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo.png"
              alt="OminiPulse"
              width={160}
              height={50}
              style={{ height: 44, width: 'auto', objectFit: 'contain', background: 'transparent' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Portal Login</Link>
            <button onClick={openOnboarding} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 13 }}>
              Create Account
            </button>
            <a href="mailto:support@ominipulse.ai" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Support</a>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            &copy; {new Date().getFullYear()} OminiPulse. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* ONBOARDING & ACCOUNT CREATION MODAL WITH BLURRED BACKGROUND    */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fadeIn 200ms ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 24,
              width: '100%',
              maxWidth: 520,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                width: 34, height: 34, borderRadius: '50%',
                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b', transition: 'all 120ms'
              }}
            >
              <X size={18} />
            </button>

            {/* ── STEP 1: ROLE SELECTION (Only Icons in Grid & Bigger) ── */}
            {activeModal === 'select' && (
              <div style={{ padding: '36px 30px 28px' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <h3 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Create Account
                  </h3>
                  <p style={{ margin: '6px 0 0', fontSize: 14, color: '#64748b' }}>
                    Choose your role to get started:
                  </p>
                </div>

                {/* 2x2 Grid of Large Icon Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                  marginBottom: 24,
                }}>
                  {/* 1. Patient */}
                  <button
                    onClick={() => setActiveModal('patient')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '26px 16px',
                      borderRadius: 18,
                      border: '2px solid #e2e8f0',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.12)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{
                      width: 76,
                      height: 76,
                      borderRadius: 22,
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.12)',
                    }}>
                      <Smartphone size={38} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 750, color: '#0f172a' }}>
                      Patient
                    </span>
                  </button>

                  {/* 2. Doctor */}
                  <button
                    onClick={() => setActiveModal('doctor')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '26px 16px',
                      borderRadius: 18,
                      border: '2px solid #e2e8f0',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.12)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{
                      width: 76,
                      height: 76,
                      borderRadius: 22,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(29, 78, 216, 0.12)',
                    }}>
                      <Stethoscope size={38} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 750, color: '#0f172a' }}>
                      Doctor
                    </span>
                  </button>

                  {/* 3. Hospital */}
                  <button
                    onClick={() => setActiveModal('hospital')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '26px 16px',
                      borderRadius: 18,
                      border: '2px solid #e2e8f0',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{
                      width: 76,
                      height: 76,
                      borderRadius: 22,
                      background: '#f1f5f9',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                    }}>
                      <Building2 size={38} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 750, color: '#0f172a' }}>
                      Hospital
                    </span>
                  </button>

                  {/* 4. Nurse */}
                  <button
                    onClick={() => setActiveModal('nurse')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '26px 16px',
                      borderRadius: 18,
                      border: '2px solid #e2e8f0',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                      gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(220, 38, 38, 0.12)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{
                      width: 76,
                      height: 76,
                      borderRadius: 22,
                      background: '#fef2f2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(220, 38, 38, 0.12)',
                    }}>
                      <Users size={38} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 750, color: '#0f172a' }}>
                      Nurse
                    </span>
                  </button>
                </div>

                <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Already have credentials? </span>
                  <Link href="/login" onClick={closeModal} style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                    Sign in here
                  </Link>
                </div>
              </div>
            )}

            {/* ── MODAL: PATIENT FLOW ────────────────────────────────────── */}
            {activeModal === 'patient' && (
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%', background: '#eff6ff',
                  color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Smartphone size={28} />
                </div>
                
                <span style={{
                  display: 'inline-block', background: '#e0f2fe', color: '#0369a1',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  textTransform: 'uppercase', marginBottom: 8
                }}>
                  Mobile App Only
                </span>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Patient Registration is on Mobile
                </h3>
                <p style={{ margin: '0 auto 24px', maxWidth: 440, fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
                  To guarantee biometric privacy, verified prescriptions, and instant emergency alerts, <strong>patient accounts are created directly in the OminiPulse Mobile App</strong>.
                </p>

                <div style={{
                  background: '#f8fafc', padding: 18, borderRadius: 14,
                  border: '1px solid #e2e8f0', marginBottom: 24
                }}>
                  <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Download the OminiPulse App to Create Your Account:
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Google Play */}
                    <button
                      onClick={() => setDownloadAppModal({ appName: 'OminiPulse Mobile Health', store: 'Google Play' })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#0f172a', color: '#ffffff', padding: '10px 18px',
                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-.954V2.768c0-.36.21-.692.61-.954zm11.233 11.234l2.585 2.585-12.247 6.942 9.662-9.527zm0-2.096L5.18 1.425l12.247 6.942-2.585 2.585zm1.485 1.048l3.655 2.073c.96.544.96 1.43 0 1.974l-3.655 2.073-2.228-2.228 2.228-1.892z" />
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>GET IT ON</span>
                        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Google Play</span>
                      </div>
                    </button>

                    {/* App Store */}
                    <button
                      onClick={() => setDownloadAppModal({ appName: 'OminiPulse Mobile Health', store: 'App Store' })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#0f172a', color: '#ffffff', padding: '10px 18px',
                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.77-.97 2.83 1.07.08 2.15-.52 2.76-1.25" />
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>Download on the</span>
                        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>App Store</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button
                    onClick={() => setActiveModal('select')}
                    style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                  >
                    &larr; Back to Role Selection
                  </button>
                </div>
              </div>
            )}

            {/* ── MODAL: DOCTOR FLOW ─────────────────────────────────────── */}
            {activeModal === 'doctor' && (
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%', background: '#dbeafe',
                  color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Stethoscope size={28} />
                </div>
                
                <span style={{
                  display: 'inline-block', background: '#dcfce7', color: '#15803d',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  textTransform: 'uppercase', marginBottom: 8
                }}>
                  Available on Desktop & Mobile Synchronized
                </span>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Doctor Clinical Practice Onboarding
                </h3>
                <p style={{ margin: '0 auto 20px', maxWidth: 460, fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
                  Doctors can register directly on the <strong>OminiPulse Mobile App</strong> for MDCN license verification, or launch the <strong>OminiPulse Desktop App</strong> once verified.
                </p>

                <div style={{
                  background: '#f8fafc', padding: 18, borderRadius: 14,
                  border: '1px solid #e2e8f0', marginBottom: 20, textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Smartphone size={18} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>Step 1: Download App to Submit MDCN License</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Google Play */}
                    <button
                      onClick={() => setDownloadAppModal({ appName: 'OminiPulse for Doctors', store: 'Google Play' })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#0f172a', color: '#ffffff', padding: '10px 18px',
                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a2.036 2.036 0 0 1-.61-.954V2.768c0-.36.21-.692.61-.954zm11.233 11.234l2.585 2.585-12.247 6.942 9.662-9.527zm0-2.096L5.18 1.425l12.247 6.942-2.585 2.585zm1.485 1.048l3.655 2.073c.96.544.96 1.43 0 1.974l-3.655 2.073-2.228-2.228 2.228-1.892z" />
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>GET IT ON</span>
                        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>Google Play</span>
                      </div>
                    </button>

                    {/* App Store */}
                    <button
                      onClick={() => setDownloadAppModal({ appName: 'OminiPulse for Doctors', store: 'App Store' })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#0f172a', color: '#ffffff', padding: '10px 18px',
                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.1-1.9 0.98-3-.95.04-2.1.63-2.77 1.42-.59.68-1.11 1.77-.97 2.83 1.07.08 2.15-.52 2.76-1.25" />
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#94a3b8', lineHeight: 1 }}>Download on the</span>
                        <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>App Store</span>
                      </div>
                    </button>
                  </div>

                  <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: '#64748b' }}>Already verified by OminiPulse?</span>
                    <Link
                      href="/login"
                      onClick={closeModal}
                      style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                    >
                      Available on Desktop App &rarr;
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal('select')}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                >
                  &larr; Back to Role Selection
                </button>
              </div>
            )}

            {/* ── MODAL: HOSPITAL FLOW ───────────────────────────────────── */}
            {activeModal === 'hospital' && (
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%', background: '#eff6ff',
                  color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Building2 size={28} />
                </div>
                
                <span style={{
                  display: 'inline-block', background: '#f1f5f9', color: '#334155',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  textTransform: 'uppercase', marginBottom: 8
                }}>
                  Enterprise Healthcare Facility
                </span>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Onboard Your Hospital on OminiPulse
                </h3>
                <p style={{ margin: '0 auto 20px', maxWidth: 460, fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
                  Hospitals are onboarded directly through our clinical operations desk. We set up your facility profile, connect blood screening pipelines, and provision administrator credentials.
                </p>

                <div style={{
                  background: '#f8fafc', padding: 20, borderRadius: 14,
                  border: '1px solid #e2e8f0', marginBottom: 20, textAlign: 'left'
                }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    Contact OminiPulse Institutional Onboarding:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <a
                      href="mailto:partnerships@ominipulse.ai?subject=Hospital%20Onboarding%20Inquiry"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Mail size={16} /> partnerships@ominipulse.ai
                    </a>
                    <a
                      href="tel:+2348006646478"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
                    >
                      <Phone size={16} /> +234 800 OMINI PULSE (+234 800 664 6478)
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveModal('select')}
                    style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                  >
                    &larr; Back to Role Selection
                  </button>
                  <Link
                    href="/login"
                    onClick={closeModal}
                    style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                  >
                    Available on Desktop App &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* ── MODAL: NURSE / STAFF FLOW ──────────────────────────────── */}
            {activeModal === 'nurse' && (
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%', background: '#fef2f2',
                  color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Users size={28} />
                </div>
                
                <span style={{
                  display: 'inline-block', background: '#fef2f2', color: '#b91c1c',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  textTransform: 'uppercase', marginBottom: 8
                }}>
                  Hospital Staff Credentials
                </span>
                <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  Contact Your Hospital Administrator
                </h3>
                <p style={{ margin: '0 auto 20px', maxWidth: 440, fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
                  Nurse, receptionist, and blood bank officer accounts are <strong>created and provisioned by your Hospital Administrator</strong>.
                </p>

                <div style={{
                  background: '#f8fafc', padding: 18, borderRadius: 14,
                  border: '1px solid #e2e8f0', marginBottom: 20, textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                      Please request your login credentials (badge ID & temporary password slip) from your facility&apos;s Medical Director or Hospital Admin.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveModal('select')}
                    style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                  >
                    &larr; Back to Role Selection
                  </button>
                  <Link
                    href="/login"
                    onClick={closeModal}
                    style={{
                      background: '#2563eb', color: '#ffffff', padding: '9px 18px',
                      borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none'
                    }}
                  >
                    Available on Desktop App &rarr;
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── DOWNLOAD APP MODAL ────────────────────────────────────── */}
      {downloadAppModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
          onClick={() => setDownloadAppModal(null)}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: 24, maxWidth: 440, width: '100%',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden', animation: 'modalSlideUp 200ms ease-out',
              position: 'relative', textAlign: 'center', padding: '32px 28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDownloadAppModal(null)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: 58, height: 58, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(37,99,235,0.25)'
            }}>
              <Smartphone size={30} />
            </div>

            <span style={{
              display: 'inline-block', background: '#eff6ff', color: '#2563eb',
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
              textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em'
            }}>
              {downloadAppModal.store}
            </span>

            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              {downloadAppModal.appName}
            </h3>

            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Available now on the official {downloadAppModal.store}. Scan the QR preview with your device camera or tap below to open the install link.
            </p>

            {/* QR Mock / Download Box */}
            <div style={{
              background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 16,
              padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 10
            }}>
              <div style={{
                width: 100, height: 100, background: '#ffffff', borderRadius: 10,
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: 8
              }}>
                {/* Visual QR pattern representation */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3,
                  width: '100%', height: '100%'
                }}>
                  {[1,1,1,0,1, 1,0,1,1,1, 1,1,0,1,0, 0,1,1,0,1, 1,1,0,1,1].map((v, i) => (
                    <div key={i} style={{ background: v ? '#0f172a' : '#ffffff', borderRadius: 1.5 }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Scan with Phone Camera</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDownloadAppModal(null)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#ffffff',
                  fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(downloadAppModal.store === 'Google Play' ? 'https://play.google.com' : 'https://apps.apple.com', '_blank');
                  setDownloadAppModal(null);
                }}
                style={{
                  flex: 2, padding: '10px 16px', borderRadius: 10,
                  border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  fontSize: 13, fontWeight: 700, color: '#ffffff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <Download size={14} /> Open {downloadAppModal.store}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
