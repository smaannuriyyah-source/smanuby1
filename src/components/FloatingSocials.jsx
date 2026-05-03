'use client';

import { useState } from 'react';
import { Share2, Instagram, Globe, Phone, X } from 'lucide-react';

export default function FloatingSocials() {
    const [isOpen, setIsOpen] = useState(false);

    const socialLinks = [
        { icon: <Phone size={20} />, href: 'https://wa.me/628812945090', label: 'WhatsApp', color: '#25D366' },
        { icon: <Instagram size={20} />, href: 'https://instagram.com/smaannuriyyah', label: 'Instagram', color: '#E1306C' },
        { icon: <Globe size={20} />, href: 'https://smaannuriyyah.sch.id', label: 'Website', color: '#2563EB' },
    ];

    return (
        <>
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {isOpen && socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.label}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: link.color,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'transform 0.2s',
                            textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {link.icon}
                    </a>
                ))}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: isOpen ? '#DC2626' : '#16A34A',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.3s, transform 0.2s',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isOpen ? <X size={24} /> : <Share2 size={24} />}
                </button>
            </div>
        </>
    );
}