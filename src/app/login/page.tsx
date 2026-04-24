'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/components/ui';
import { AlertTriangle, Loader2, Fingerprint, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("ACCESS_DENIED // INVALID_CREDENTIALS");
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="absolute top-6 left-6 text-xs font-subhead text-cyan/50 tracking-[0.2em]">
        SEC_AUTH // V1.0<br/>
        RESTRICTED_AREA
      </div>

      <div className="w-full max-w-md p-8 md:p-12 cyber-card border-glow animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10 relative">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border border-cyan flex items-center justify-center bg-cyan/5 text-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-display text-cyan text-glow-cyan tracking-[0.2em] mb-2 uppercase glitch-text" data-text="ROOT_ACCESS">ROOT_ACCESS</h1>
          <p className="text-xs font-subhead text-dark-gray tracking-[0.3em] uppercase">AUTHORIZATION REQUIRED</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="ADMIN_ID [EMAIL]"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@pcc.polines"
          />
          <Input
            label="PASSKEY"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="flex items-center p-4 text-xs font-bold text-crimson cyber-input border border-crimson bg-crimson/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,60,0.1)_10px,rgba(255,0,60,0.1)_20px)]"></div>
              <AlertTriangle className="w-5 h-5 mr-3 relative z-10 animate-pulse" />
              <span className="relative z-10 tracking-widest">{error}</span>
            </div>
          )}

          <div className="pt-6">
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center py-4 text-sm group">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Fingerprint className="w-5 h-5 mr-3 group-hover:text-glow-cyan" />}
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE_LOGIN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
