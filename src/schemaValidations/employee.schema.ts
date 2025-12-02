import z from 'zod';

export const employeeSearchSchema = z.object({
  fullName: z.string().optional().nullable(),
  kind: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  username: z.string().optional().nullable()
});

export const employeeSchema = (isEditing: boolean) =>
  z
    .object({
      avatarPath: z.string().optional().nullable(),
      email: z.string().min(1, 'Bắt buộc').email('Email không đúng định dạng'),
      fullName: z.string().min(1, 'Bắt buộc'),
      groupId: z.string().min(1, 'Bắt buộc'),
      phone: z
        .string()
        .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
        .optional(),
      status: z.number(),

      username: z.string().min(1, 'Bắt buộc'),

      password: z.string().optional().nullable(),

      confirmPassword: z.string().optional().nullable(),

      oldPassword: z.string().optional().nullable(),

      newPassword: z.string().optional().nullable(),

      confirmNewPassword: z.string().optional().nullable()
    })

    .superRefine((data, ctx) => {
      if (!isEditing) {
        if (!data.password) {
          ctx.addIssue({
            code: 'custom',
            path: ['password'],
            message: 'Bắt buộc'
          });
          if (!data.confirmPassword) {
            ctx.addIssue({
              code: 'custom',
              path: ['confirmPassword'],
              message: 'Bắt buộc'
            });
          }
        } else {
          if (data.password.length < 8)
            ctx.addIssue({
              code: 'custom',
              path: ['password'],
              message: 'Mật khẩu tối thiểu 8 ký tự'
            });
          if (!/[A-Z]/.test(data.password))
            ctx.addIssue({
              code: 'custom',
              path: ['password'],
              message: 'Mật khẩu phải có ít nhất 1 chữ hoa'
            });
          if (!/[a-z]/.test(data.password))
            ctx.addIssue({
              code: 'custom',
              path: ['password'],
              message: 'Mật khẩu phải có ít nhất 1 chữ thường'
            });
          if (!/[0-9]/.test(data.password))
            ctx.addIssue({
              code: 'custom',
              path: ['password'],
              message: 'Mật khẩu phải có ít nhất 1 chữ số'
            });
          if (!/[^A-Za-z0-9]/.test(data.password))
            ctx.addIssue({
              code: 'custom',
              path: ['password'],
              message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
            });
        }

        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: 'Mật khẩu nhập lại không khớp'
          });
        }
      }

      if (isEditing) {
        if (data.newPassword || data.confirmNewPassword || data.oldPassword) {
          if (!data.oldPassword) {
            ctx.addIssue({
              code: 'custom',
              path: ['oldPassword'],
              message: 'Vui lòng nhập mật khẩu cũ'
            });
          }

          if (!data.newPassword) {
            ctx.addIssue({
              code: 'custom',
              path: ['newPassword'],
              message: 'Vui lòng nhập mật khẩu mới'
            });
          } else {
            if (data.newPassword.length < 8)
              ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Mật khẩu tối thiểu 8 ký tự'
              });
            if (!/[A-Z]/.test(data.newPassword))
              ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Mật khẩu phải có ít nhất 1 chữ hoa'
              });
            if (!/[a-z]/.test(data.newPassword))
              ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Mật khẩu phải có ít nhất 1 chữ thường'
              });
            if (!/[0-9]/.test(data.newPassword))
              ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Mật khẩu phải có ít nhất 1 chữ số'
              });
            if (!/[^A-Za-z0-9]/.test(data.newPassword))
              ctx.addIssue({
                code: 'custom',
                path: ['newPassword'],
                message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'
              });

            if (!data.confirmNewPassword) {
              ctx.addIssue({
                code: 'custom',
                path: ['confirmNewPassword'],
                message: 'Bắt buộc'
              });
            } else if (data.newPassword !== data.confirmNewPassword) {
              ctx.addIssue({
                code: 'custom',
                path: ['confirmNewPassword'],
                message: 'Mật khẩu nhập lại không khớp'
              });
            }
          }
        }
      }
    });
