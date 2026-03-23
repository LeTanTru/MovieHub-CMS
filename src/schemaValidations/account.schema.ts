import { z } from 'zod';

export const profileSchema = z
  .object({
    fullName: z.string().nonempty('Bắt buộc'),
    avatarPath: z.string().optional(),

    oldPassword: z.string().nonempty('Bắt buộc'),
    password: z.string().optional().nullable(),
    confirmPassword: z.string().optional().nullable()
  })
  .superRefine((data, ctx) => {
    const hasOld = !!data.oldPassword;
    const hasNew = !!data.password;
    const hasConfirm = !!data.confirmPassword;

    if (hasOld && !hasNew && !hasConfirm) return;

    if (hasNew && !hasConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Bắt buộc'
      });
    }

    if (!hasNew && hasConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Bắt buộc'
      });
      return;
    }

    if (hasNew) {
      const pwd = data.password!;

      if (pwd.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Mật khẩu tối thiểu 8 ký tự'
        });
      }
      if (!/[A-Z]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Mật khẩu phải có ít nhất 1 chữ hoa'
        });
      }
      if (!/[a-z]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Mật khẩu phải có ít nhất 1 chữ thường'
        });
      }
      if (!/[0-9]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Mật khẩu phải có ít nhất 1 chữ số'
        });
      }
      if (!/[^A-Za-z0-9]/.test(pwd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
        });
      }

      if (hasConfirm && data.password !== data.confirmPassword) {
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
      email: z
        .string()
        .nonempty('Bắt buộc')
        .check(z.email('Email không hợp lệ')),
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
