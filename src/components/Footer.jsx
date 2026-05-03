'use client';

import React from 'react';
import { Phone, MapPin, Instagram, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="spmb" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '80px 0 20px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '20px' }}>SMA An-Nuriyyah</h3>
            <p style={{ color: '#9CA3AF', lineHeight: '1.8', fontSize: '0.95rem' }}>
              Membentuk generasi Ulil Albab yang unggul dalam ilmu, amaliah, dan ibadah. Berdiri sejak 1982 di Bumiayu, Brebes.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Kontak</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#9CA3AF' }}>
                <MapPin size={18} style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>Jl. Bandung No. 55, Bumiayu, Brebes, Jawa Tengah</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9CA3AF' }}>
                <Phone size={18} />
                <span>08812945090</span>
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Media Sosial</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <a href="https://instagram.com/smaannuriyyah" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9CA3AF', textDecoration: 'none' }}>
                <Instagram size={18} />
                <span>@smaannuriyyah</span>
              </a>
              <a href="https://smaannuriyyah.sch.id" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9CA3AF', textDecoration: 'none' }}>
                <Globe size={18} />
                <span>smaannuriyyah.sch.id</span>
              </a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} SMA An-Nuriyyah Bumiayu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}