import { z } from 'zod';

export const employeeSearchSchema = z.object({
  fullName: z.string().optional().nullable(),
  kind: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.number().optional().nullable(),
  username: z.string().optional().nullable()
});

export const employeeSchema = (isEditing: boolean) =>
  z
    .object({
      avatarPath: z.string().optional().nullable(),
      email: z
        .string()
        .nonempty('Bắt buộc')
        .check(z.email('Email không hợp lệ')),
      fullName: z.string().nonempty('Bắt buộc'),
      groupId: z.string().nonempty('Bắt buộc'),
      phone: z
        .string()
        .nonempty('Bắt buộc')
        .regex(/^\d{10}$/, 'Số điện thoại phải gồm 10 chữ số')
        .regex(
          /^0[35789][0-9]{8}$/,
          'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09'
        ),
      status: z.number(),

      username: z.string().nonempty('Bắt buộc'),

      password: z.string().optional().nullable(),

      confirmPassword: z.string().optional().nullable(),

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

        if (data.password && !data.confirmPassword) {
          ctx.addIssue({
            code: 'custom',
            path: ['confirmPassword'],
            message: 'Vui lòng nhập lại mật khẩu'
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
        if (data.newPassword || data.confirmNewPassword) {
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
