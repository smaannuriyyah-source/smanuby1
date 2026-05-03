'use client';

import { ArrowRight, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function BlogPost({ id, image, date, title, excerpt, category }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link href={`/article/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}
      >
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img src={image || '/images/1.webp'} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            {category && <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '500' }}>{category}</span>}
            {date && <span style={{ color: '#9CA3AF', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} />{formatDate(date)}</span>}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', lineHeight: '1.4' }}>{title}</h3>
          {excerpt && <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: '1.6' }}>{excerpt}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontWeight: '600', fontSize: '0.9rem', marginTop: '15px' }}>
            Baca Selengkapnya <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}