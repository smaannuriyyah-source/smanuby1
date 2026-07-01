'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  {
    name: 'Pengumuman',
    children: [
      { name: 'Pengumuman', href: '/pengumuman' },
      { name: 'Programs', href: '/#programs' },
      { name: 'Blog', href: '/allpost' },
    ],
  },
  { name: 'Data Laporan', href: '/data-laporan' },
  { name: 'SPMB', href: '/#spmb' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = isHomePage && !scrolled;

  const style = isDark
    ? { bg: 'transparent', blur: 'none', shadow: 'none', textColor: '#ffffff', logoColor: '#ffffff', padding: '25px 0' }
    : { bg: 'rgba(255, 255, 255, 0.95)', blur: 'blur(12px)', shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textColor: '#111827', logoColor: '#111827', padding: '15px 0' };

  const NavLink = ({ link }) => {
    if (link.children) {
      return (
        <li style={{ position: 'relative' }}
          onMouseEnter={() => setOpenDropdown(link.name)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <button style={{
            color: style.textColor, fontSize: '0.95rem', fontWeight: 500,
            textDecoration: 'none', transition: 'color 0.3s',
            textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px',
            fontFamily: 'inherit'
          }}>
            {link.name} <ChevronDown size={14} />
          </button>
          {openDropdown === link.name && (
            <div style={{
              position: 'absolute', top: '100%', left: 0,
              backgroundColor: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              borderRadius: '8px', padding: '8px 0', minWidth: '160px',
              zIndex: 1002, marginTop: '8px'
            }}>
              {link.children.map((child) => (
                <Link key={child.name} href={child.href}
                  onClick={() => setOpenDropdown(null)}
                  style={{
                    display: 'block', padding: '10px 20px',
                    color: '#374151', fontSize: '0.9rem', fontWeight: 500,
                    textDecoration: 'none', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </li>
      );
    }
    return (
      <li>
        {link.href.startsWith('/#') ? (
          <a href={link.href} style={{ color: style.textColor, fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.3s', textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : 'none' }}>
            {link.name}
          </a>
        ) : (
          <Link href={link.href} style={{ color: style.textColor, fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.3s', textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : 'none' }}>
            {link.name}
          </Link>
        )}
      </li>
    );
  };

  const MobileNavLink = ({ link }) => {
    if (link.children) {
      const isOpen = openDropdown === link.name;
      return (
        <div>
          <button onClick={() => setOpenDropdown(isOpen ? null : link.name)}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              fontSize: '1.2rem', color: '#111827', fontWeight: 600,
              borderBottom: '1px solid #F3F4F6', padding: '12px 0',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
            {link.name}
            <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {isOpen && (
            <div style={{ paddingLeft: '16px' }}>
              {link.children.map((child) => (
                <Link key={child.name} href={child.href} onClick={() => { setOpenDropdown(null); setIsOpen(false); }}
                  style={{
                    display: 'block', padding: '10px 0', color: '#374151',
                    fontSize: '1rem', fontWeight: 500, textDecoration: 'none',
                    borderBottom: '1px solid #F3F4F6'
                  }}>
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link href={link.href} onClick={() => setIsOpen(false)}
        style={{ fontSize: '1.2rem', color: '#111827', fontWeight: 600, borderBottom: '1px solid #F3F4F6', padding: '12px 0', textDecoration: 'none', display: 'block' }}>
        {link.name}
      </Link>
    );
  };

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, backgroundColor: style.bg, backdropFilter: style.blur, boxShadow: style.shadow, padding: style.padding, transition: 'all 0.3s ease' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: style.logoColor, textDecoration: 'none', transition: 'color 0.3s' }}>
          SMA Annuriyyah
        </Link>

        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ul style={{ display: 'flex', gap: '30px', marginRight: '20px', listStyle: 'none', padding: 0 }}>
            {navLinks.map((link) => (
              <NavLink key={link.name} link={link} />
            ))}
          </ul>
          <Link href="/pendaftaran" style={{ padding: '8px 20px', backgroundColor: '#F59E0B', color: '#ffffff', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)' }}>
            Daftar SPMB
          </Link>
          <Link href="/login" style={{ padding: '8px 25px', backgroundColor: isDark ? '#16A34A' : '#16A34A', color: '#ffffff', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
            Login
          </Link>
        </div>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', color: isOpen ? '#111827' : style.textColor, display: 'none' }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>

      <div style={{ position: 'fixed', top: 0, right: 0, width: '70%', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-10px 0 20px rgba(0,0,0,0.1)', padding: '80px 30px', transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1001 }}>
        {navLinks.map((link) => (
          <MobileNavLink key={link.name} link={link} />
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
