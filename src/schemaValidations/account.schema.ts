import z from 'zod';

export const profileSchema = z
  .object({
    email: z.string().nonempty('Bắt buộc').email('Email không đúng định dạng'),
    fullName: z.string().nonempty('Bắt buộc'),
    avatarPath: z.string().optional(),
    phone: z
      .string()
      .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
      .optional(),

    oldPassword: z.string().optional().nullable(),
    newPassword: z.string().optional().nullable(),
    confirmPassword: z.string().optional().nullable(),

    logoPath: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.oldPassword && !data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'Vui lòng nhập mật khẩu mới'
      });
      return;
    }

    if (data.newPassword) {
      const pwd = data.newPassword;

      if (pwd.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Mật khẩu tối thiểu 8 ký tự'
        });
      }

      if (!/[A-Z]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Mật khẩu phải có ít nhất 1 chữ hoa'
        });
      }

      if (!/[a-z]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Mật khẩu phải có ít nhất 1 chữ thường'
        });
      }

      if (!/[0-9]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Mật khẩu phải có ít nhất 1 chữ số'
        });
      }

      if (!/[^A-Za-z0-9]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
        });
      }
    }

    if (!data.oldPassword && data.newPassword && data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['oldPassword'],
        message: 'Bắt buộc'
      });
    }

    if (data.newPassword || data.confirmPassword) {
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Mật khẩu xác nhận không khớp'
        });
      }
    }
  });

export const accountSearchSchema = z.object({
  email: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  kind: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  isSuperAdmin: z.boolean().optional().nullable(),
  status: z.number().optional().nullable(),
  username: z.string().optional().nullable()
});

export const accountSchema = (isEditing: boolean) =>
  z
    .object({
      email: z.string().nonempty('Bắt buộc'),
      password: isEditing
        ? z.string().optional()
        : z
            .string()
            .nonempty('Bắt buộc')
            .min(8, 'Mật khẩu tối thiểu 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
            .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
      confirmPassword: isEditing
        ? z.string().optional()
        : z.string().nonempty('Bắt buộc'),
      fullName: z.string().nonempty('Bắt buộc'),
      avatarPath: z.string().optional(),
      groupId: z.string().nonempty('Bắt buộc'),
      status: z.number({ error: 'Bắt buộc' }),
      username: z.string().nonempty('Bắt buộc'),
      kind: z.number().optional(),
      phone: z
        .string()
        .nonempty('Bắt buộc')
        .regex(/^\d{10}$/, 'Số điện thoại phải gồm 10 chữ số')
    })
    .refine(
      (data) => {
        if (!isEditing) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp'
      }
    );
