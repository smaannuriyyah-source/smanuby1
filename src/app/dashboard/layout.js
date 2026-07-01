'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, FileText, User, Users, FolderOpen, ClipboardList, Megaphone, Database } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token) {
            router.push('/login');
            return;
        }
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/articles', label: 'Artikel', icon: FileText },
        { href: '/dashboard/categories', label: 'Kategori', icon: FolderOpen },
        { href: '/dashboard/announcements', label: 'Pengumuman', icon: Megaphone },
        { href: '/dashboard/data-laporan', label: 'Data Laporan', icon: Database },
        { href: '/dashboard/registrations', label: 'Pendaftaran', icon: ClipboardList },
        ...(user?.role === 'admin' ? [{ href: '/dashboard/users', label: 'Pengguna', icon: Users }] : []),
        { href: '/dashboard/profile', label: 'Profile', icon: User },
    ];

    if (!user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#16A34A', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="dashboard-hamburger"
                style={{
                    position: 'fixed',
                    top: '16px',
                    left: '16px',
                    zIndex: 1001,
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>

            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #E5E7EB',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                height: '100vh',
                zIndex: 1000,
                overflowY: 'auto'
            }}
            className="dashboard-sidebar"
            data-open={sidebarOpen}
            >
                <div style={{ marginBottom: '40px', padding: '0 10px' }}>
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                            CMS Admin
                        </h1>
                    </Link>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {navLinks.map(link => {
                            const isActive = pathname === link.href;
                            const IconComponent = link.icon;
                            return (
                                <li key={link.href} style={{ marginBottom: '10px' }}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setSidebarOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                                            color: isActive ? '#2563EB' : '#374151',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <IconComponent size={20} /> {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{user.name}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{user.role}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#ffffff',
                            color: '#DC2626',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                />
            )}

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: '250px', padding: '40px', minHeight: '100vh' }}
                className="dashboard-main"
            >
                {children}
            </main>

            <style>{`
                .dashboard-hamburger {
                    display: none;
                }
                .dashboard-sidebar {
                    left: 0;
                }
                @media (max-width: 768px) {
                    .dashboard-hamburger {
                        display: block !important;
                    }
                    .dashboard-sidebar {
                        left: -260px;
                        transition: left 0.3s ease;
                    }
                    .dashboard-sidebar[data-open="true"] {
                        left: 0;
                    }
                    .dashboard-main {
                        margin-left: 0 !important;
                        padding: 20px !important;
                        padding-top: 60px !important;
                    }
                }
            `}</style>
        </div>
    );
}