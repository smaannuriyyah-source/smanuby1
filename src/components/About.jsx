'use client';

import { ArrowUpRight } from 'lucide-react';
import RevealOnScroll from './RevealOnScroll';

export default function About() {
    return (
        <section id="about" className="section-padding" style={{ position: 'relative' }}>
            <div className="container" style={{ position: 'relative' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', alignItems: 'center' }}>

                    <div style={{
                        gridColumn: '1 / 6',
                        backgroundColor: '#111827',
                        color: '#fff',
                        padding: '60px 40px',
                        zIndex: 2,
                        position: 'relative',
                        marginTop: '50px',
                        borderRadius: '2px'
                    }} className="about-card">
                        <p style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '60px', opacity: 0.7, color: '#FCD34D' }}>Sejarah Kami</p>
                        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px', lineHeight: '1.3' }}>
                            Pesantren An-Nuriyyah:<br />
                            Dedikasi Sejak 1940-an
                        </h2>
                        <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.6' }}>
                            Berawal dari rintisan majelis taklim dan tahfiz Al-Qur&apos;an oleh KH. Abu Nur Jazuli Amaith Al-Hafidz.
                            Diakui resmi pada 1 April 1974, kemudian berkembang mendirikan SMA An-Nuriyyah pada tahun 1982.
                        </p>
                    </div>

                    <div style={{ position: 'absolute', right: '100px', top: '-50px', zIndex: 0 }}>
                        <div className="crosshair" style={{ marginBottom: '50px' }}></div>
                        <div className="crosshair" style={{ marginBottom: '50px', marginLeft: '50px' }}></div>
                    </div>

                    <div style={{ gridColumn: '7 / 13', paddingLeft: '40px' }}>
                        <RevealOnScroll>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ width: '200px', height: '250px', backgroundColor: '#E5E7EB', overflow: 'hidden', borderRadius: '4px' }}>
                                    <img src="/images/1.webp" alt="Kegiatan Sekolah" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <div style={{ flex: 1, paddingTop: '20px' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Visi & Misi</h3>
                                    <p style={{ color: '#4B5563', lineHeight: '1.6', marginBottom: '20px', fontSize: '0.95rem' }}>
                                        <strong>Visi:</strong> Membentuk Generasi ULIL ALBAB (Unggul, Ilmiah, Amaliyah, Ibadah dan Bertanggung Jawab).
                                    </p>
                                    <p style={{ color: '#4B5563', lineHeight: '1.6', marginBottom: '30px', fontSize: '0.95rem' }}>
                                        <strong>Misi:</strong> Menciptakan keunggulan lokal dengan karakter pendidikan Al-Qur&apos;an dan suasana pembelajaran yang ilmiah.
                                    </p>

                                    <a href="#profil" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        color: '#16A34A',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        borderBottom: '1px solid #16A34A',
                                        paddingBottom: '2px'
                                    }}>
                                        Selengkapnya <ArrowUpRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </RevealOnScroll>

                        <RevealOnScroll delay={0.4}>
                            <div style={{ width: '100%', height: '250px', backgroundColor: '#F3F4F6', marginTop: '30px', overflow: 'hidden', borderRadius: '4px' }}>
                                <img src="/images/2.webp" alt="Lingkungan Sekolah" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        </RevealOnScroll>
                    </div>

                </div>
            </div>

            <style>{`
        @media (max-width: 900px) {
           .about-card { grid-column: 1 / -1 !important; margin-top: 0 !important; }
           div[style*="column: 7 / 13"] { grid-column: 1 / -1 !important; padding-left: 0 !important; margin-top: 40px; }
        }
      `}</style>
        </section>
    );
}