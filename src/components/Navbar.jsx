'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  { name: 'Programs', href: '/#programs' },
  { name: 'Blog', href: '/#blog' },
  { name: 'Pengumuman', href: '/pengumuman' },
  { name: 'SPMB', href: '/#spmb' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const style = scrolled
    ? { bg: 'rgba(255, 255, 255, 0.8)', blur: 'blur(12px)', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textColor: '#111827', logoColor: '#111827', padding: '15px 0' }
    : { bg: 'transparent', blur: 'none', shadow: 'none', textColor: '#ffffff', logoColor: '#ffffff', padding: '25px 0' };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, backgroundColor: style.bg, backdropFilter: style.blur, boxShadow: style.shadow, padding: style.padding, transition: 'all 0.3s ease' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: style.logoColor, textDecoration: 'none', transition: 'color 0.3s' }}>
          SMA Annuriyyah
        </Link>

        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ul style={{ display: 'flex', gap: '30px', marginRight: '20px', listStyle: 'none', padding: 0 }}>
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.href.startsWith('/#') ? (
                  <a href={link.href} style={{ color: style.textColor, fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.3s', textShadow: scrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {link.name}
                  </a>
                ) : (
                  <Link href={link.href} style={{ color: style.textColor, fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.3s', textShadow: scrolled ? 'none' : '0 2px 4px rgba(0,0,0,0.3)' }}>
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link href="/pendaftaran" style={{ padding: '8px 20px', backgroundColor: scrolled ? '#F59E0B' : 'rgba(245, 158, 11, 0.9)', color: '#ffffff', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>
            Daftar SPMB
          </Link>
          <Link href="/login" style={{ padding: '8px 25px', backgroundColor: scrolled ? '#16A34A' : '#ffffff', color: scrolled ? '#ffffff' : '#111827', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', border: scrolled ? 'none' : '2px solid transparent' }}>
            Login
          </Link>
        </div>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', color: isOpen ? '#111827' : style.textColor, display: 'none' }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

      <div style={{ position: 'fixed', top: 0, right: 0, width: '70%', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-10px 0 20px rgba(0,0,0,0.1)', padding: '80px 30px', transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1001 }}>
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} style={{ fontSize: '1.2rem', color: '#111827', fontWeight: 600, borderBottom: '1px solid #F3F4F6', paddingBottom: '15px', textDecoration: 'none' }}>
            {link.name}
          </Link>
        ))}
        <Link href="/pendaftaran" onClick={() => setIsOpen(false)} style={{ marginTop: '10px', textAlign: 'center', backgroundColor: '#F59E0B', color: '#ffffff', padding: '12px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
          Daftar PPDB Sekarang
        </Link>
        <Link href="/login" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', backgroundColor: '#16A34A', color: '#ffffff', padding: '12px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
          Login
        </Link>
      </div>

      {isOpen && <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />}

      <style>{`
        @media (max-width: 900px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @media (min-width: 901px) {
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}