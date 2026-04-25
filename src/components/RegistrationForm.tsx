'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormValues } from '@/lib/schema';
import { Input, Button, cn } from '@/components/ui';
import { createClient } from '@/utils/supabase/client';
import { Upload, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Send, Sparkles, Download, Printer } from 'lucide-react';

const paymentMethods = [
  { label: 'BNI', value: 'BNI', number: '1803699258', name: 'Davin Alifianda Adytia' },
  { label: 'SHOPEEPAY', value: 'ShopeePay', number: '081327029089', name: 'Davin Alifianda Adytia' },
  { label: 'DANA', value: 'Dana', number: '081327029089', name: 'Davin Alifianda Adytia' },
  { label: 'BCA', value: 'BCA', number: '0092410976', name: 'Davin Alifianda Adytia' },
  { label: 'SEABANK', value: 'SeaBank', number: '901905136860', name: 'Davin Alifianda Adytia' },
];

const galleryPhotos = [
  'sertijab1.jpg',
  'sertijab2.jpg',
  'sertijab3.jpg',
  'sertijab4.jpg',
];

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already registered on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('pcc_sertijab_registration');
    if (savedData) {
      try {
        setSubmittedData(JSON.parse(savedData));
        setIsSuccess(true);
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      isPresent: true,
      hasVehicle: false,
      readyToDrive: false,
      absenceReason: '',
    },
  });

  const isPresent = watch('isPresent');
  const paymentMethod = watch('paymentMethod');
  const paymentProof = watch('paymentProof');
  const permissionProof = watch('permissionProof');

  // Clear errors and values when switching attendance status
  React.useEffect(() => {
    if (isPresent) {
      setValue('absenceReason', '');
      setValue('permissionProof', undefined);
    } else {
      setValue('paymentMethod', undefined);
      setValue('paymentProof', undefined);
      setValue('foodAllergy', '');
      setValue('illnessHistory', '');
      setValue('hasVehicle', false);
      setValue('readyToDrive', false);
    }
  }, [isPresent, setValue]);

  const nextStep = async () => {
    if (step === 0) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const fieldsToValidate = ['fullName', 'nim', 'class', 'studyProgram', 'whatsapp', 'isPresent'] as const;
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(2);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const downloadReceipt = () => {
    if (!submittedData) return;
    
    const receiptText = `
========================================
       BUKTI PENDAFTARAN SERTIJAB
          UKM PCC POLINES 2026
========================================
ID PENDAFTARAN: PCC-${submittedData.nim.replace(/\./g, '')}
WAKTU: ${new Date().toLocaleString('id-ID')}
----------------------------------------
NAMA      : ${submittedData.fullName.toUpperCase()}
NIM       : ${submittedData.nim}
KELAS     : ${submittedData.class}
PRODI     : ${submittedData.studyProgram}
WHATSAPP  : ${submittedData.whatsapp}
STATUS    : ${submittedData.isPresent ? 'HADIR' : 'TIDAK HADIR'}

${submittedData.isPresent ? `
DETAIL KEHADIRAN:
- ALERGI      : ${submittedData.foodAllergy || '-'}
- RIWAYAT SAKIT: ${submittedData.illnessHistory || '-'}
- BAWA MOTOR  : ${submittedData.hasVehicle ? 'YA' : 'TIDAK'}
- SIAP BONCENG : ${submittedData.readyToDrive ? 'YA' : 'TIDAK'}
- METODE BAYAR : ${submittedData.paymentMethod}
` : `
DETAIL KETIDAKHADIRAN:
- ALASAN: ${submittedData.absenceReason}
`}
----------------------------------------
SIMPAN BUKTI INI UNTUK VERIFIKASI
TERIMA KASIH TELAH MENDAFTAR!
========================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_Sertijab_${submittedData.nim}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();

    try {
      let paymentProofUrl = '';
      let permissionProofUrl = '';

      if (data.isPresent && data.paymentProof?.[0]) {
        const file = data.paymentProof[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${data.nim}_payment_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, file);
        
        if (uploadError) throw new Error('Gagal upload bukti pembayaran');
        paymentProofUrl = uploadData.path;
      }

      if (!data.isPresent && data.permissionProof?.[0]) {
        const file = data.permissionProof[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${data.nim}_permission_${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(fileName, file);
        
        if (uploadError) throw new Error('Gagal upload bukti perizinan');
        permissionProofUrl = uploadData.path;
      }

      const { error: submitError } = await supabase.from('registrations').insert({
        full_name: data.fullName,
        nim: data.nim,
        class: data.class,
        study_program: data.studyProgram,
        whatsapp: data.whatsapp,
        is_present: data.isPresent,
        food_allergy: data.foodAllergy,
        illness_history: data.illnessHistory,
        has_vehicle: data.hasVehicle,
        ready_to_drive: data.readyToDrive,
        payment_method: data.paymentMethod,
        payment_proof_url: paymentProofUrl,
        absence_reason: data.absenceReason,
        permission_proof_url: permissionProofUrl,
      });

      if (submitError) {
        if (submitError.code === '23505') {
          throw new Error('NIM sudah terdaftar!');
        }
        throw new Error(submitError.message);
      }

      // Save to localStorage to prevent multiple submissions
      localStorage.setItem('pcc_sertijab_registration', JSON.stringify(data));
      setSubmittedData(data);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && submittedData) {
    return (
      <div className="flex flex-col items-center p-6 md:p-12 tactile-card relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 w-full h-3 bg-green-500"></div>
        
        <div className="bg-green-100 p-4 rounded-full mb-6 border-4 border-green-600 shadow-[4px_4px_0px_#166534]">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-display text-dark-espresso mb-2 tracking-wide text-shadow-orange text-center uppercase">Pendaftaran Selesai!</h2>
        <p className="text-rustic-brown font-body font-bold text-sm mb-8 uppercase tracking-widest text-center">Data kamu sudah tersimpan di sistem kami.</p>

        {/* Receipt UI */}
        <div className="w-full max-w-md bg-white border-4 border-dark-espresso p-6 mb-8 relative shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-soft-cream border-r-4 border-dark-espresso rounded-r-full"></div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-soft-cream border-l-4 border-dark-espresso rounded-l-full"></div>
          
          <div className="text-center border-b-2 border-dashed border-dark-espresso/30 pb-4 mb-4">
            <p className="font-display text-xl text-dark-espresso">SERTIJAB 2026</p>
            <p className="text-[10px] font-subhead font-bold text-deep-cocoa/60 tracking-[0.2em] uppercase">Bukti Pendaftaran Resmi</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-subhead font-bold text-deep-cocoa/50">
              <span>NAMA</span>
              <span className="text-right text-dark-espresso">{submittedData.fullName.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-subhead font-bold text-deep-cocoa/50">
              <span>NIM</span>
              <span className="text-right text-dark-espresso">{submittedData.nim}</span>
            </div>
            <div className="flex justify-between text-[11px] font-subhead font-bold text-deep-cocoa/50">
              <span>KELAS</span>
              <span className="text-right text-dark-espresso">{submittedData.class}</span>
            </div>
            <div className="flex justify-between text-[11px] font-subhead font-bold text-deep-cocoa/50">
              <span>STATUS</span>
              <span className={cn(
                "text-right font-black px-2 py-0.5 rounded",
                submittedData.isPresent ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {submittedData.isPresent ? 'HADIR' : 'ABSEN'}
              </span>
            </div>
            
            {submittedData.isPresent && (
              <div className="flex justify-between text-[11px] font-subhead font-bold text-deep-cocoa/50">
                <span>METODE BAYAR</span>
                <span className="text-right text-dark-espresso uppercase">{submittedData.paymentMethod}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-dark-espresso/30 text-center">
            <p className="text-[10px] font-body font-bold text-red-600 uppercase mb-2">!!! SIMPAN SCREENSHOT/DOWNLOAD INI SEBAGAI BUKTI !!!</p>
            <div className="bg-dark-espresso text-white py-2 px-4 inline-block rounded font-mono text-xs">
              ID: PCC-{submittedData.nim.replace(/\./g, '')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Button onClick={downloadReceipt} variant="secondary" className="flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" /> DOWNLOAD
          </Button>
          <Button onClick={() => window.print()} variant="secondary" className="flex items-center justify-center">
            <Printer className="w-5 h-5 mr-2" /> CETAK
          </Button>
          <Button onClick={() => window.location.href = 'https://web-kehadiran-sertijab.vercel.app/'} className="sm:col-span-2 group">
            KEMBALI KE BERANDA <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {step === 0 ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="tactile-card overflow-hidden">
            <div className="bg-electric-orange p-8 text-center border-b-4 border-dark-espresso">
              <div className="inline-block px-3 py-1 bg-dark-espresso text-cream text-[10px] font-subhead font-bold rounded mb-4 tracking-[0.3em] uppercase">
                Official Invitation
              </div>
              <h1 className="text-4xl md:text-6xl font-display text-white text-shadow-orange leading-tight tracking-tight uppercase">
                Serah Terima Jabatan<br/>UKM PCC 2026
              </h1>
            </div>
            
            <div className="p-8 md:p-12 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-subhead font-bold text-dark-espresso text-sm tracking-widest uppercase flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-electric-orange" /> Kilas Balik 2025
                  </h3>
                  <div className="h-px flex-1 bg-dark-espresso/10 ml-4"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 max-w-4xl mx-auto">
                  {galleryPhotos.map((img, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "aspect-video bg-white p-3 pb-10 border-4 border-white shadow-2xl transition-all duration-500 hover:rotate-0 hover:scale-[1.02] hover:z-10 cursor-pointer relative overflow-hidden",
                        i % 2 === 0 ? "rotate-1" : "-rotate-1"
                      )}
                    >
                      <div className="w-full h-full bg-dark-espresso overflow-hidden rounded-sm border border-dark-espresso/5 relative group">
                        <img 
                          src={`/gallery/${img}`} 
                          alt={`Sertijab Moment ${i+1}`}
                          className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110" 
                        />
                        {/* Overlay to soften and blend colors */}
                        <div className="absolute inset-0 bg-electric-orange/5 mix-blend-multiply pointer-events-none"></div>
                        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                      </div>
                      <div className="absolute bottom-2 w-full left-0 text-center">
                        <span className="font-display text-[10px] text-dark-espresso opacity-40 uppercase tracking-[0.3em]">Moment #{i+1} — Sertijab 2025</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-4">
                  <h2 className="font-display text-3xl text-dark-espresso tracking-tight">"Merawat Amanah, Mewujudkan Arah"</h2>
                  <p className="font-body text-deep-cocoa leading-relaxed text-sm md:text-base">
                    Sertijab bukan sekadar seremoni pergantian pengurus, melainkan simbol keberlanjutan semangat dan visi UKM PCC. Tahun ini, kita berkumpul untuk mempererat tali persaudaraan sekaligus menyusun strategi demi mewujudkan arah organisasi yang lebih progresif dan inklusif.
                  </p>
                  <p className="font-body text-deep-cocoa leading-relaxed text-sm md:text-base italic font-bold">
                    Siapkan dirimu untuk menjadi bagian dari sejarah baru PCC Polines!
                  </p>
                </div>
                
                <div className="bg-soft-cream p-6 rounded-2xl border-2 border-dark-espresso/10 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-subhead font-bold text-rustic-brown uppercase tracking-widest">WAKTU</p>
                    <p className="font-bold text-dark-espresso text-sm uppercase">14-15 MEI 2026</p>
                    <p className="text-[10px] font-body text-deep-cocoa/60 uppercase">Kamis - Jumat</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-subhead font-bold text-rustic-brown uppercase tracking-widest">LOKASI</p>
                    <p className="font-bold text-dark-espresso text-sm uppercase">VILLA BOKONG SEMAR</p>
                    <p className="text-[10px] font-body text-deep-cocoa/60 uppercase">Kabupaten Semarang</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={nextStep} className="w-full py-6 group text-xl relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center">
                    MULAI PENDAFTARAN <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Button>
                <p className="text-center mt-4 text-[10px] font-subhead font-bold text-deep-cocoa/40 tracking-widest uppercase">
                  Segera daftarkan dirimu sekarang!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8 md:p-12 tactile-card relative animate-in slide-in-from-bottom-5 duration-500">
          <button 
            type="button" 
            onClick={() => setStep(step - 1)}
            className="absolute top-4 left-4 p-2 hover:bg-dark-espresso/5 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-dark-espresso group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="absolute top-4 right-4 text-[10px] font-subhead font-bold text-deep-cocoa opacity-20 tracking-[0.2em] uppercase">
            ID: PCC_BOARD_2026
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-7xl font-display text-electric-orange text-shadow-orange mb-4 tracking-tight -rotate-1">
              PENDATAAN<br/>SERTIJAB
            </h1>
            <div className="inline-block px-4 py-1 bg-dark-espresso text-cream font-subhead font-bold text-sm rounded-lg tracking-[0.3em] uppercase">
              UKM PCC POLINES 2026
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="NAMA LENGKAP"
                  required
                  placeholder="Ketik nama lengkap..."
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />
                <Input
                  label="NIM"
                  required
                  placeholder="Contoh: 4.33.xx.x.xx"
                  {...register('nim')}
                  error={errors.nim?.message}
                />
                <Input
                  label="KELAS"
                  required
                  placeholder="Contoh: IK-1A"
                  {...register('class')}
                  error={errors.class?.message}
                />
                <Input
                  label="PROGRAM STUDI"
                  required
                  placeholder="Contoh: D3 - Teknik Informatika"
                  {...register('studyProgram')}
                  error={errors.studyProgram?.message}
                />
              </div>
              
              <Input
                label="NOMOR WHATSAPP"
                required
                placeholder="08xxxxxxxxxx"
                {...register('whatsapp')}
                error={errors.whatsapp?.message}
              />
              
              <div className="space-y-4 pt-4 border-t-4 border-dark-espresso/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">STATUS KEHADIRAN</label>
                  <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">Wajib</span>
                </div>
                <Controller
                  name="isPresent"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className={cn(
                        "flex-1 flex items-center justify-center space-x-3 cursor-pointer p-5 tactile-input rounded-2xl group transition-all",
                        field.value === true && "!bg-electric-orange"
                      )}>
                        <input
                          type="radio"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="board-checkbox"
                        />
                        <span className={cn(
                          "font-bold text-lg tracking-wide uppercase transition-colors",
                          field.value === true ? "text-white" : "text-amber-800"
                        )}>HADIR</span>
                      </label>
                      <label className={cn(
                        "flex-1 flex items-center justify-center space-x-3 cursor-pointer p-5 tactile-input rounded-2xl group transition-all",
                        field.value === false && "!bg-rustic-brown"
                      )}>
                        <input
                          type="radio"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="board-checkbox"
                        />
                        <span className={cn(
                          "font-bold text-lg tracking-wide uppercase transition-colors",
                          field.value === false ? "text-white" : "text-amber-800"
                        )}>TIDAK</span>
                      </label>
                    </div>
                  )}
                />
                {errors.isPresent && <p className="mt-2 text-xs text-red-600 font-bold uppercase tracking-tight text-center">! Pilih status kehadiran</p>}
              </div>

              <div className="pt-6">
                <Button type="button" onClick={nextStep} className="w-full py-5 group">
                  LANJUTKAN <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
              {isPresent === true ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="ALERGI MAKANAN"
                      placeholder="Contoh: Udang, Kacang..."
                      {...register('foodAllergy')}
                    />
                    <Input
                      label="RIWAYAT PENYAKIT"
                      placeholder="Contoh: Asma, Maag..."
                      {...register('illnessHistory')}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 py-4">
                    <label className="flex-1 flex flex-col p-4 tactile-input rounded-xl has-[:checked]:bg-soft-tangerine/20 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-subhead font-bold text-dark-espresso text-sm tracking-tight uppercase">BAWA KENDARAAN</span>
                        <span className="text-[10px] px-2 py-0.5 bg-dark-espresso/10 text-dark-espresso/60 font-bold rounded-full tracking-tighter uppercase">Opsional</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('hasVehicle')}
                          className="board-checkbox"
                        />
                        <span className="text-xs font-bold text-dark-espresso/40">SAYA MEMBAWA MOTOR</span>
                      </div>
                    </label>
                    <label className="flex-1 flex flex-col p-4 tactile-input rounded-xl has-[:checked]:bg-soft-tangerine/20 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-subhead font-bold text-dark-espresso text-sm tracking-tight uppercase">SIAP BONCENGIN</span>
                        <span className="text-[10px] px-2 py-0.5 bg-dark-espresso/10 text-dark-espresso/60 font-bold rounded-full tracking-tighter uppercase">Opsional</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('readyToDrive')}
                          className="board-checkbox"
                        />
                        <span className="text-xs font-bold text-dark-espresso/40">SIAP MEMBONCENG TEMAN</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t-4 border-dark-espresso/10">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">METODE PEMBAYARAN</label>
                      <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">Wajib</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {paymentMethods.map((m) => (
                        <label key={m.value} className="flex flex-col items-center justify-center p-4 tactile-input rounded-xl cursor-pointer has-[:checked]:bg-electric-orange has-[:checked]:text-white transition-all group text-center">
                          <input
                            type="radio"
                            value={m.value}
                            {...register('paymentMethod')}
                            className="hidden"
                          />
                          <span className="font-bold text-xs tracking-widest uppercase">{m.label}</span>
                        </label>
                      ))}
                    </div>

                    {paymentMethod && (
                      <div className="mt-4 p-5 bg-dark-espresso text-white rounded-2xl border-4 border-electric-orange shadow-[6px_6px_0px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col items-center text-center">
                          <div className="text-[10px] font-subhead font-bold text-electric-orange tracking-widest uppercase mb-2">DETAIL TRANSFER</div>
                          <div className="font-display text-2xl mb-1 tracking-tight">
                            {paymentMethods.find(m => m.value === paymentMethod)?.number}
                          </div>
                          <div className="text-xs font-bold text-cream/60 uppercase tracking-widest">
                            A.N {paymentMethods.find(m => m.value === paymentMethod)?.name}
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const num = paymentMethods.find(m => m.value === paymentMethod)?.number;
                              if (num) navigator.clipboard.writeText(num);
                              alert('Nomor berhasil disalin!');
                            }}
                            className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-colors border border-white/20"
                          >
                            Salin Nomor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">UPLOAD BUKTI TRANSFER</label>
                      <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">Wajib</span>
                    </div>
                    <div className="relative group">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dark-espresso border-dashed rounded-2xl cursor-pointer bg-soft-cream/50 hover:bg-soft-cream transition-colors overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                          <Upload className={cn("w-12 h-12 mb-4 transition-transform", paymentProof?.[0] ? "text-green-600 scale-90" : "text-rustic-brown group-hover:scale-110")} />
                          <p className="mb-1 text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase truncate max-w-full">
                            {paymentProof?.[0] ? paymentProof[0].name : "KLIK UNTUK UPLOAD"}
                          </p>
                          <p className="text-[10px] font-body text-deep-cocoa opacity-60">
                            {paymentProof?.[0] ? `${(paymentProof[0].size / 1024).toFixed(1)} KB` : "PNG, JPG (MAX. 2MB)"}
                          </p>
                        </div>
                        <input type="file" className="hidden" {...register('paymentProof')} accept="image/*,application/pdf" />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">ALASAN KETIDAKHADIRAN</label>
                      <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">Wajib</span>
                    </div>
                    <textarea
                      {...register('absenceReason')}
                      className={cn(
                        "block p-4 w-full text-base font-body text-dark-espresso tactile-input placeholder:text-deep-cocoa/40 outline-none rounded-2xl",
                        errors.absenceReason && "border-red-600 shadow-[4px_4px_0px_#991b1b]"
                      )}
                      placeholder="Berikan alasan yang jelas..."
                      rows={5}
                    ></textarea>
                    {errors.absenceReason && <p className="mt-2 text-xs text-red-600 font-bold uppercase tracking-tight">! {errors.absenceReason.message}</p>}
                  </div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">UPLOAD SURAT IZIN</label>
                      <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">Wajib (PDF)</span>
                    </div>
                    <div className="relative group">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dark-espresso border-dashed rounded-2xl cursor-pointer bg-soft-cream/50 hover:bg-soft-cream transition-colors overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                          <Upload className={cn("w-12 h-12 mb-4 transition-transform", permissionProof?.[0] ? "text-green-600 scale-90" : "text-rustic-brown group-hover:scale-110")} />
                          <p className="mb-1 text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase truncate max-w-full">
                            {permissionProof?.[0] ? permissionProof[0].name : "KLIK UNTUK UPLOAD"}
                          </p>
                          <p className="text-[10px] font-body text-deep-cocoa opacity-60">
                            {permissionProof?.[0] ? `${(permissionProof[0].size / 1024).toFixed(1)} KB` : "PDF ONLY (MAX. 2MB)"}
                          </p>
                        </div>
                        <input type="file" className="hidden" {...register('permissionProof')} accept="application/pdf" />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center p-4 mt-4 bg-red-100 border-3 border-red-600 rounded-xl shadow-[4px_4px_0px_#991b1b]" role="alert">
                  <AlertCircle className="flex-shrink-0 inline w-6 h-6 mr-3 text-red-600" />
                  <span className="font-bold text-red-700 uppercase text-xs tracking-wider">{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="sm:w-1/3 py-5">
                  <ArrowLeft className="w-5 h-5 mr-2" /> KEMBALI
                </Button>
                <Button type="submit" disabled={isSubmitting} className="sm:w-2/3 py-5 group">
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Send className="w-6 h-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  {isSubmitting ? 'MENGIRIM...' : 'KIRIM DATA'}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
