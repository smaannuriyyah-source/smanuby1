import './globals.css';
import { Outfit, Playfair_Display } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata = {
  title: 'SMA An-Nuriyyah Bumiayu',
  description: 'Website resmi SMA An-Nuriyyah Bumiayu - Membentuk Generasi Ulil Albab',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}