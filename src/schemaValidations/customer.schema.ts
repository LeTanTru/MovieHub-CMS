import z from 'zod';

export const customerSearchSchema = z.object({
  fullName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.number().optional().nullable()
});

export const customerSchema = z
  .object({
    avatarPath: z.string().optional().nullable(),
    email: z.string().nonempty('Bắt buộc'),
    fullName: z.string().nonempty('Bắt buộc'),
    logoPath: z.string().nonempty('Bắt buộc'),
    phone: z
      .string()
      .nonempty('Bắt buộc')
      .regex(/^\d{10}$/, 'Số điện thoại phải gồm 10 chữ số'),

    oldPassword: z.string().optional().nullable(),
    newPassword: z.string().optional().nullable(),
    confirmPassword: z.string().optional().nullable()
  })
  .superRefine((data, ctx) => {
    const { oldPassword, newPassword, confirmPassword } = data;

    if (newPassword || oldPassword) {
      if (!oldPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['oldPassword'],
          message: 'Vui lòng nhập mật khẩu cũ'
        });
      }

      if (!newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Vui lòng nhập mật khẩu mới'
        });
        return;
      }

      const passwordRules: { regex: RegExp; message: string }[] = [
        { regex: /^.{8,}$/, message: 'Mật khẩu tối thiểu 8 ký tự' },
        { regex: /[A-Z]/, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' },
        { regex: /[a-z]/, message: 'Mật khẩu phải có ít nhất 1 chữ thường' },
        { regex: /[0-9]/, message: 'Mật khẩu phải có ít nhất 1 chữ số' },
        {
          regex: /[^A-Za-z0-9]/,
          message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
        }
      ];

      for (const rule of passwordRules) {
        if (!rule.regex.test(newPassword)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['newPassword'],
            message: rule.message
          });
        }
      }

      if (newPassword !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Mật khẩu nhập lại không khớp'
        });
      }
    }
  });
