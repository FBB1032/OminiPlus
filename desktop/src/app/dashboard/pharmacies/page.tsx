'use client';

import { Pill, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function PharmaciesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pill size={22} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title" style={{ margin: 0 }}>Pharmacy Network Management</h1>
              <span style={{
                background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a',
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                Coming Soon
              </span>
            </div>
            <p className="page-subtitle" style={{ margin: '3px 0 0' }}>
              Digital pharmacy network onboarding, PCN license verification, and automated prescription dispensing.
            </p>
          </div>
        </div>
      </div>

      {/* Closed / Coming Soon Notice Card */}
      <Card style={{ padding: '64px 24px', textAlign: 'center', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', color: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
        }}>
          <Pill size={36} />
        </div>
        <span style={{
          display: 'inline-block', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
          fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginBottom: 12,
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          Closed • Feature Coming Soon
        </span>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Pharmacy Network Integration is Coming Soon
        </h2>
        <p style={{ maxWidth: 540, margin: '0 auto 24px', color: '#64748b', fontSize: 14.5, lineHeight: 1.6 }}>
          The direct digital pharmacy onboarding and prescription dispensing module is currently under final Pharmacists Council of Nigeria (PCN) compliance audit and testing. This module will be unlocked in an upcoming release.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16, background: '#f8fafc',
          padding: '12px 20px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#475569',
          flexWrap: 'wrap', justifyContent: 'center'
        }}>
          <span>Status: <strong style={{ color: '#b45309' }}>Closed (Coming Soon)</strong></span>
          <span>•</span>
          <span>Target Rollout: <strong>OminiPulse v2.1</strong></span>
          <span>•</span>
          <span>Regulatory Filing: <strong>In Progress</strong></span>
        </div>

        <div style={{ marginTop: 32 }}>
          <Link
            href="/dashboard/hospitals"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', background: '#2563eb', color: '#ffffff',
              borderRadius: 8, fontSize: 13.5, fontWeight: 600, textDecoration: 'none'
            }}
          >
            Return to Hospitals Directory <ArrowRight size={15} />
          </Link>
        </div>
      </Card>
    </div>
  );
}
