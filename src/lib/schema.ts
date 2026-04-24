import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nim: z.string().regex(/^\d\.\d{2}\.\d{2}\.\d\.\d{2}$/, 'NIM harus sesuai format (contoh: 4.33.xx.x.xx)'),
  class: z.string().min(1, 'Kelas harus diisi'),
  studyProgram: z.string().min(1, 'Program studi harus diisi'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit'),
  isPresent: z.boolean(),
  // Conditional fields (Present)
  foodAllergy: z.string().optional(),
  illnessHistory: z.string().optional(),
  hasVehicle: z.boolean().optional(),
  readyToDrive: z.boolean().optional(),
  paymentMethod: z.string().optional(),
  paymentProof: z.any().optional(), // Handled separately for upload
  // Conditional fields (Absent)
  absenceReason: z.string().optional(),
  permissionProof: z.any().optional(), // Handled separately for upload
}).superRefine((data, ctx) => {
  if (data.isPresent) {
    if (!data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Metode pembayaran harus dipilih',
        path: ['paymentMethod'],
      });
    }
  } else {
    if (!data.absenceReason || data.absenceReason.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Alasan ketidakhadiran minimal 5 karakter',
        path: ['absenceReason'],
      });
    }
  }
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
