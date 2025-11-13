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
    oldPassword: z.string().nonempty('Bắt buộc'),
    newPassword: z.string().optional().nullable(),
    confirmPassword: z.string().optional().nullable(),
    logoPath: z.string().optional()
  })
  .refine(
    (data) => {
      return data.newPassword === data.confirmPassword;
    },
    {
      path: ['confirmPassword'],
      message: 'Mật khẩu xác nhận không khớp'
    }
  );

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
            .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số')
            .regex(/[^A-Za-z0-9]/, 'Phải có ít nhất 1 ký tự đặc biệt'),
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
