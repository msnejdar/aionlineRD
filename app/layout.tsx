import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Kontrola Nemovitostí',
  description: 'Automatická kontrola údajů o nemovitostech pomocí umělé inteligence',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        <main className="min-h-screen py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
