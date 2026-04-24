import { createClient } from '@/utils/supabase/server';
import AdminDashboard from '@/components/AdminDashboard';
import { AlertCircle, Activity } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex items-center p-8 bg-red-100 border-4 border-red-600 rounded-2xl shadow-[8px_8px_0px_#991b1b]">
        <AlertCircle className="w-10 h-10 text-red-600 mr-4" />
        <div>
          <h2 className="text-2xl font-display text-red-700 uppercase">SYSTEM ERROR</h2>
          <p className="font-body font-bold text-red-600">GAGAL MENGAMBIL DATA: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-cream border-4 border-dark-espresso p-8 rounded-3xl shadow-[8px_8px_0px_var(--color-deep-cocoa)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-orange opacity-5 -mr-20 -mt-20 rounded-full"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-display text-dark-espresso tracking-tight text-shadow-orange uppercase">COMMAND CENTER</h1>
          <p className="font-subhead text-rustic-brown font-bold text-sm tracking-[0.2em] flex items-center gap-2 mt-2">
            <Activity className="w-4 h-4 text-electric-orange animate-pulse" /> LIVE MONITORING ACTIVE
          </p>
        </div>
        
        <div className="relative z-10 bg-dark-espresso text-cream px-6 py-4 rounded-2xl border-2 border-white shadow-md rotate-2 hidden sm:block">
          <p className="text-[10px] font-subhead font-bold tracking-[0.3em] uppercase opacity-60">EVENT_ID</p>
          <p className="text-xl font-display leading-none mt-1">SERTIJAB_2026</p>
        </div>
      </div>
      
      <AdminDashboard initialData={data || []} />
    </div>
  );
}
