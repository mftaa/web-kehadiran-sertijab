import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui';
import { LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-dark-espresso flex flex-col relative z-10">
      {/* Texture Background */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-black mix-blend-overlay paper-texture"></div>
      
      <nav className="bg-cream border-b-4 border-dark-espresso sticky top-0 z-50 shadow-[0_4px_0px_rgba(51,20,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-electric-orange p-2 rounded-xl border-3 border-dark-espresso shadow-[3px_3px_0px_#602600]">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-display text-dark-espresso tracking-tight block leading-none">PCC_ADMIN</span>
              <span className="text-[10px] font-subhead font-bold text-rustic-brown tracking-[0.2em] uppercase">SYSTEM CONTROL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-xs font-subhead font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full border-2 border-green-600">
              <ShieldCheck className="w-4 h-4" /> SECURE_SESSION
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="secondary" type="submit" className="py-2 px-4 text-xs">
                <LogOut className="w-4 h-4 mr-2" /> LOGOUT
              </Button>
            </form>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
