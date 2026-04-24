'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button, Input, cn } from '@/components/ui';
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Bike, 
  UserPlus, 
  LayoutDashboard, 
  ListFilter,
  ArrowRightLeft,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

interface Registration {
  id: string;
  full_name: string;
  nim: string;
  class: string;
  study_program: string;
  whatsapp: string;
  is_present: boolean;
  has_vehicle: boolean;
  ready_to_drive: boolean;
  food_allergy?: string;
  illness_history?: string;
  payment_method?: string;
  payment_proof_url?: string;
  absence_reason?: string;
  permission_proof_url?: string;
  created_at: string;
}

export default function AdminDashboard({ initialData }: { initialData: Registration[] }) {
  const [data, setData] = useState<Registration[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'plotting' | 'allergy' | 'illness'>('list');
  const supabase = createClient();

  const filteredData = data.filter((item) =>
    item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nim.includes(searchTerm)
  );

  const stats = {
    total: data.length,
    present: data.filter((item) => item.is_present).length,
    absent: data.filter((item) => !item.is_present).length,
    vehicles: data.filter((item) => item.is_present && item.has_vehicle).length,
    noVehicles: data.filter((item) => item.is_present && !item.has_vehicle).length,
  };

  // Logic Plotting Boncengan
  const drivers = data.filter(item => item.is_present && item.has_vehicle);
  const passengers = data.filter(item => item.is_present && !item.has_vehicle);
  
  const plotting = [];
  const maxPairs = Math.min(drivers.length, passengers.length);
  
  for (let i = 0; i < maxPairs; i++) {
    plotting.push({ driver: drivers[i], passenger: passengers[i] });
  }

  const leftoverDrivers = drivers.slice(maxPairs);
  const leftoverPassengers = passengers.slice(maxPairs);

  const allergyList = data.filter(item => item.is_present && item.food_allergy && item.food_allergy.trim() !== '');
  const illnessList = data.filter(item => item.is_present && item.illness_history && item.illness_history.trim() !== '');

  const exportCSV = () => {
    const headers = ['Nama', 'NIM', 'Kelas', 'Prodi', 'WA', 'Hadir', 'Alergi', 'Penyakit', 'Bawa Motor', 'Metode Bayar', 'Alasan'];
    const rows = data.map((item) => [
      item.full_name,
      item.nim,
      item.class,
      item.study_program,
      item.whatsapp,
      item.is_present ? 'Ya' : 'Tidak',
      item.food_allergy || '-',
      item.illness_history || '-',
      item.has_vehicle ? 'Ya' : 'Tidak',
      item.payment_method || '-',
      item.absence_reason || '-',
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `REKAP_SERTIJAB_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPublicUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from('proofs').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 tactile-card bg-cream text-dark-espresso relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <p className="text-[10px] font-subhead font-bold tracking-widest uppercase opacity-60">TOTAL PESERTA</p>
          <p className="text-4xl font-display mt-1">{stats.total}</p>
        </div>
        <div className="p-6 tactile-card bg-green-50 text-green-900 border-green-600 shadow-[6px_6px_0px_#166534] relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform text-green-600">
            <CheckCircle2 size={80} />
          </div>
          <p className="text-[10px] font-subhead font-bold tracking-widest uppercase opacity-60">HADIR</p>
          <p className="text-4xl font-display mt-1">{stats.present}</p>
        </div>
        <div className="p-6 tactile-card bg-electric-orange text-white border-dark-espresso shadow-[6px_6px_0px_#602600] relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-20 group-hover:scale-110 transition-transform">
            <Bike size={80} />
          </div>
          <p className="text-[10px] font-subhead font-bold tracking-widest uppercase opacity-80">BAWA MOTOR</p>
          <p className="text-4xl font-display mt-1">{stats.vehicles}</p>
        </div>
        <div className="p-6 tactile-card bg-soft-cream text-dark-espresso border-dark-espresso shadow-[6px_6px_0px_#602600] relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
            <UserPlus size={80} />
          </div>
          <p className="text-[10px] font-subhead font-bold tracking-widest uppercase opacity-60">BUTUH BONCENGAN</p>
          <p className="text-4xl font-display mt-1">{stats.noVehicles}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/20 rounded-2xl w-fit mx-auto border-3 border-dark-espresso shadow-[4px_4px_0px_var(--color-deep-cocoa)]">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-subhead font-bold text-sm uppercase tracking-widest transition-all",
            activeTab === 'list' 
              ? "bg-electric-orange text-white shadow-[3px_3px_0px_#602600] translate-y-[-2px]" 
              : "text-cream/40 hover:text-cream hover:bg-white/5"
          )}
        >
          <ListFilter className="inline-block w-4 h-4 mr-2" /> DATA MASTER
        </button>
        <button
          onClick={() => setActiveTab('plotting')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-subhead font-bold text-sm uppercase tracking-widest transition-all",
            activeTab === 'plotting' 
              ? "bg-electric-orange text-white shadow-[3px_3px_0px_#602600] translate-y-[-2px]" 
              : "text-cream/40 hover:text-cream hover:bg-white/5"
          )}
        >
          <ArrowRightLeft className="inline-block w-4 h-4 mr-2" /> PLOTTINGAN
        </button>
        <button
          onClick={() => setActiveTab('allergy')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-subhead font-bold text-sm uppercase tracking-widest transition-all",
            activeTab === 'allergy' 
              ? "bg-electric-orange text-white shadow-[3px_3px_0px_#602600] translate-y-[-2px]" 
              : "text-cream/40 hover:text-cream hover:bg-white/5"
          )}
        >
          <AlertTriangle className="inline-block w-4 h-4 mr-2" /> DATA ALERGI
        </button>
        <button
          onClick={() => setActiveTab('illness')}
          className={cn(
            "px-6 py-2.5 rounded-xl font-subhead font-bold text-sm uppercase tracking-widest transition-all",
            activeTab === 'illness' 
              ? "bg-electric-orange text-white shadow-[3px_3px_0px_#602600] translate-y-[-2px]" 
              : "text-cream/40 hover:text-cream hover:bg-white/5"
          )}
        >
          <HeartPulse className="inline-block w-4 h-4 mr-2" /> DATA SAKIT
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-espresso/40 w-5 h-5" />
              <input
                type="text"
                placeholder="CARI NAMA / NIM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 tactile-input rounded-2xl text-dark-espresso font-body font-bold outline-none placeholder:text-dark-espresso/20"
              />
            </div>
            <Button onClick={exportCSV} variant="secondary" className="whitespace-nowrap px-8 py-4">
              <Download className="w-5 h-5 mr-2" /> DUMP CSV
            </Button>
          </div>

          <div className="tactile-card bg-soft-cream overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body border-collapse">
                <thead className="bg-dark-espresso text-cream font-subhead uppercase tracking-widest text-xs">
                  <tr>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">PESERTA</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">NIM / KELAS</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa text-center">STATUS</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa text-center">MOTOR</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dark-espresso/5">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-white transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-dark-espresso uppercase">{item.full_name}</p>
                        <p className="text-[10px] text-rustic-brown font-subhead">{item.study_program}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-dark-espresso">{item.nim}</p>
                        <p className="text-[10px] text-rustic-brown font-subhead uppercase">{item.class}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.is_present ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold border-2 border-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> HADIR
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border-2 border-red-600">
                            <XCircle className="w-3 h-3 mr-1" /> ABSEN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.is_present && (
                          item.has_vehicle ? (
                            <Bike className="w-6 h-6 mx-auto text-electric-orange" />
                          ) : (
                            <span className="text-xs font-bold text-dark-espresso/30">-</span>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(item.payment_proof_url || item.permission_proof_url) ? (
                          <a
                            href={getPublicUrl(item.payment_proof_url || item.permission_proof_url!) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-dark-espresso text-white rounded-xl text-xs font-bold hover:bg-rustic-brown transition-all shadow-[3px_3px_0px_#602600] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          >
                            <Eye className="w-4 h-4 mr-2" /> BUKTI
                          </a>
                        ) : (
                          <span className="text-[10px] italic text-dark-espresso/40">TANPA FILE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="p-20 text-center text-dark-espresso/20">
                  <LayoutDashboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-display text-xl">DATA TIDAK DITEMUKAN</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'plotting' ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-electric-orange/10 p-6 tactile-card border-electric-orange border-dashed">
            <h3 className="font-display text-2xl text-dark-espresso mb-2">SIMULASI PLOTTINGAN</h3>
            <p className="text-sm font-body text-rustic-brown leading-relaxed">
              Sistem mencocokkan pendaftar yang **Hadir & Bawa Motor** dengan pendaftar yang **Hadir & Butuh Boncengan** secara otomatis 1:1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plotting.map((pair, idx) => (
              <div key={idx} className="tactile-card bg-white p-6 relative group hover:-rotate-1 transition-all">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-dark-espresso text-cream flex items-center justify-center rounded-full font-display text-sm border-2 border-white shadow-md">
                  {idx + 1}
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-soft-tangerine/10 rounded-xl border-2 border-electric-orange/30">
                    <p className="text-[10px] font-subhead font-bold text-electric-orange mb-1 uppercase tracking-widest flex items-center">
                      <Bike className="w-3 h-3 mr-1" /> DRIVER
                    </p>
                    <p className="font-bold text-dark-espresso truncate">{pair.driver.full_name}</p>
                    <p className="text-[10px] text-rustic-brown">{pair.driver.class}</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRightLeft className="text-dark-espresso/20 rotate-90" />
                  </div>
                  <div className="p-3 bg-dark-espresso/5 rounded-xl border-2 border-dark-espresso/10">
                    <p className="text-[10px] font-subhead font-bold text-dark-espresso/60 mb-1 uppercase tracking-widest flex items-center">
                      <UserPlus className="w-3 h-3 mr-1" /> PASSENGER
                    </p>
                    <p className="font-bold text-dark-espresso truncate">{pair.passenger.full_name}</p>
                    <p className="text-[10px] text-rustic-brown">{pair.passenger.class}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(leftoverDrivers.length > 0 || leftoverPassengers.length > 0) && (
            <div className="space-y-6 pt-10 border-t-4 border-dark-espresso/5">
              <h3 className="font-display text-xl text-dark-espresso uppercase tracking-wider">BELUM DAPAT PASANGAN</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leftoverDrivers.length > 0 && (
                  <div className="tactile-card bg-cream p-6">
                    <p className="font-subhead font-bold text-dark-espresso uppercase tracking-widest mb-4 border-b-2 border-dark-espresso/10 pb-2">
                      LEBIHAN DRIVER ({leftoverDrivers.length})
                    </p>
                    <div className="space-y-2">
                      {leftoverDrivers.map(d => (
                        <div key={d.id} className="flex items-center justify-between text-sm font-bold text-dark-espresso/70 bg-white/50 p-2 rounded-lg">
                          <span>{d.full_name}</span>
                          <span className="text-[10px] opacity-40">{d.class}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {leftoverPassengers.length > 0 && (
                  <div className="tactile-card bg-soft-cream p-6">
                    <p className="font-subhead font-bold text-rustic-brown uppercase tracking-widest mb-4 border-b-2 border-dark-espresso/10 pb-2">
                      LEBIHAN PENUMPANG ({leftoverPassengers.length})
                    </p>
                    <div className="space-y-2">
                      {leftoverPassengers.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm font-bold text-dark-espresso/70 bg-white/50 p-2 rounded-lg">
                          <span>{p.full_name}</span>
                          <span className="text-[10px] opacity-40">{p.class}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'allergy' ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-2xl text-dark-espresso flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-electric-orange" /> REKAP ALERGI MAKANAN
            </h3>
            <Button 
              variant="secondary" 
              onClick={() => {
                const text = allergyList.map((item, index) => `${index + 1}. ${item.full_name} (${item.class}): ${item.food_allergy}`).join('\n');
                navigator.clipboard.writeText(text);
                alert('Data alergi berhasil disalin ke clipboard!');
              }}
              className="px-6 py-2 text-xs"
            >
              SALIN REKAP
            </Button>
          </div>

          <div className="tactile-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body border-collapse">
                <thead className="bg-electric-orange text-white font-subhead uppercase tracking-widest text-xs">
                  <tr>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa w-16 text-center">NO</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">NAMA PESERTA</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">NIM / KELAS</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">DETAIL ALERGI</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dark-espresso/5 text-dark-espresso">
                  {allergyList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-soft-cream transition-colors">
                      <td className="px-6 py-4 text-center font-bold opacity-30">{index + 1}</td>
                      <td className="px-6 py-4 font-bold uppercase">{item.full_name}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold">{item.nim}</p>
                        <p className="text-[10px] uppercase font-subhead text-rustic-brown">{item.class}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-electric-orange/10 text-electric-orange rounded-lg font-bold text-xs border border-electric-orange/20">
                          {item.food_allergy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allergyList.length === 0 && (
                <div className="p-20 text-center text-dark-espresso/20 italic">Tidak ada data alergi</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-2xl text-dark-espresso flex items-center">
              <HeartPulse className="w-6 h-6 mr-2 text-rustic-brown" /> REKAP RIWAYAT PENYAKIT
            </h3>
            <Button 
              variant="secondary" 
              onClick={() => {
                const text = illnessList.map((item, index) => `${index + 1}. ${item.full_name} (${item.class}): ${item.illness_history}`).join('\n');
                navigator.clipboard.writeText(text);
                alert('Data riwayat penyakit berhasil disalin ke clipboard!');
              }}
              className="px-6 py-2 text-xs"
            >
              SALIN REKAP
            </Button>
          </div>

          <div className="tactile-card bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body border-collapse">
                <thead className="bg-rustic-brown text-white font-subhead uppercase tracking-widest text-xs">
                  <tr>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa w-16 text-center">NO</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">NAMA PESERTA</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">NIM / KELAS</th>
                    <th className="px-6 py-4 border-b-4 border-deep-cocoa">DETAIL PENYAKIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dark-espresso/5 text-dark-espresso">
                  {illnessList.map((item, index) => (
                    <tr key={item.id} className="hover:bg-soft-cream transition-colors">
                      <td className="px-6 py-4 text-center font-bold opacity-30">{index + 1}</td>
                      <td className="px-6 py-4 font-bold uppercase">{item.full_name}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold">{item.nim}</p>
                        <p className="text-[10px] uppercase font-subhead text-rustic-brown">{item.class}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-rustic-brown/10 text-rustic-brown rounded-lg font-bold text-xs border border-rustic-brown/20">
                          {item.illness_history}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {illnessList.length === 0 && (
                <div className="p-20 text-center text-dark-espresso/20 italic">Tidak ada data riwayat penyakit</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
