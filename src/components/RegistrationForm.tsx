'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormValues } from '@/lib/schema';
import { Input, Button, Select, cn } from '@/components/ui';
import { createClient } from '@/utils/supabase/client';
import { Upload, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Send, Sparkles } from 'lucide-react';

const paymentMethods = [
  { label: 'BNI', value: 'BNI' },
  { label: 'SHOPEEPAY', value: 'ShopeePay' },
  { label: 'DANA', value: 'Dana' },
  { label: 'BCA', value: 'BCA' },
  { label: 'SEABANK', value: 'SeaBank' },
];

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    trigger,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      isPresent: true,
      hasVehicle: false,
      readyToDrive: false,
    },
  });

  const isPresent = watch('isPresent');
  const paymentProof = watch('paymentProof');
  const permissionProof = watch('permissionProof');

  const nextStep = async () => {
    const fieldsToValidate = ['fullName', 'nim', 'class', 'studyProgram', 'whatsapp', 'isPresent'] as const;
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(2);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 tactile-card text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-electric-orange"></div>
        <div className="bg-green-100 p-6 rounded-full mb-8 border-4 border-green-600 shadow-[4px_4px_0px_#166534]">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-4xl font-display text-dark-espresso mb-4 tracking-wide text-shadow-orange">BERHASIL!</h2>
        <p className="text-rustic-brown font-body font-bold text-lg max-w-md mx-auto mb-10 leading-relaxed">
          DATA KAMU SUDAH MASUK KE PAPAN PERMAINAN. SAMPAI JUMPA DI SERTIJAB 2026!
        </p>
        <Button onClick={() => window.location.reload()} className="group">
          MAIN LAGI <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8 md:p-12 tactile-card relative">
      <div className="absolute top-4 right-4 text-[10px] font-subhead font-bold text-deep-cocoa opacity-20 tracking-[0.2em] uppercase">
        ID: PCC_BOARD_2026
      </div>

      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-7xl font-display text-electric-orange text-shadow-orange mb-4 tracking-tight -rotate-1">
          PENDAFTARAN<br/>SERTIJAB
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
              placeholder="Ketik nama lengkap..."
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <Input
              label="NIM"
              placeholder="Contoh: 4.33.xx.x.xx"
              {...register('nim')}
              error={errors.nim?.message}
            />
            <Input
              label="KELAS"
              placeholder="Contoh: IK-1A"
              {...register('class')}
              error={errors.class?.message}
            />
            <Input
              label="PROGRAM STUDI"
              placeholder="Contoh: D3 - Teknik Informatika"
              {...register('studyProgram')}
              error={errors.studyProgram?.message}
            />
          </div>
          
          <Input
            label="NOMOR WHATSAPP"
            placeholder="08xxxxxxxxxx"
            {...register('whatsapp')}
            error={errors.whatsapp?.message}
          />
          
          <div className="space-y-4 pt-4 border-t-4 border-dark-espresso/10">
            <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">STATUS KEHADIRAN</label>
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
                <label className="flex-1 flex items-center space-x-3 cursor-pointer p-4 tactile-input rounded-xl has-[:checked]:bg-soft-tangerine/20">
                  <input
                    type="checkbox"
                    {...register('hasVehicle')}
                    className="board-checkbox"
                  />
                  <span className="font-subhead font-bold text-dark-espresso text-sm tracking-tight uppercase">BAWA KENDARAAN</span>
                </label>
                <label className="flex-1 flex items-center space-x-3 cursor-pointer p-4 tactile-input rounded-xl has-[:checked]:bg-soft-tangerine/20">
                  <input
                    type="checkbox"
                    {...register('readyToDrive')}
                    className="board-checkbox"
                  />
                  <span className="font-subhead font-bold text-dark-espresso text-sm tracking-tight uppercase">SIAP BONCENGIN</span>
                </label>
              </div>
              
              <div className="space-y-4 pt-4 border-t-4 border-dark-espresso/10">
                <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase text-center">METODE PEMBAYARAN</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((m) => (
                    <label key={m.value} className="flex flex-col items-center justify-center p-4 tactile-input rounded-xl cursor-pointer has-[:checked]:bg-electric-orange has-[:checked]:text-white transition-all group">
                      <input
                        type="radio"
                        value={m.value}
                        {...register('paymentMethod')}
                        className="hidden"
                      />
                      <span className="text-amber-800 font-bold text-xs tracking-widest uppercase">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <label className="block mb-3 text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">UPLOAD BUKTI TRANSFER</label>
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
                <label className="block text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">ALASAN KETIDAKHADIRAN</label>
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
                <label className="block mb-3 text-sm font-subhead font-bold text-dark-espresso tracking-widest uppercase">UPLOAD SURAT IZIN (PDF)</label>
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
  );
}
