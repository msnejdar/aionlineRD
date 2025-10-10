'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Nesprávné heslo');
      }
    } catch (err) {
      setError('Chyba při přihlašování');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="card max-w-md w-full fade-in" style={{ boxShadow: 'var(--shadow-elevation-4)', margin: '24px' }}>
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevation-3)'
            }}
          >
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-2" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            AI Kontrola Nemovitostí
          </h1>
          <p style={{ color: 'var(--color-neutral-medium)', fontSize: '1rem' }}>
            Automatické vyhodnocení nemovitostí
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block mb-2"
              style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}
            >
              Heslo
            </label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadejte heslo..."
              autoFocus
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <p className="font-medium" style={{ fontSize: '0.95rem' }}>
                {error}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: '0.875rem', color: 'var(--color-neutral-medium)' }}>
          Pouze pro autorizovaný personál
        </p>
      </div>
    </div>
  );
}
