import AdminJS from 'adminjs'
import * as AdminJSMongoose from '@adminjs/mongoose'
import AdminJSExpress from '@adminjs/express'

import Professional from '../DB/models/professional.model.js'
import DeletedProfessional from '../DB/models/deletedProfessional.model.js'
import { sendEmail } from './utils/SendEmail.js'

AdminJS.registerAdapter(AdminJSMongoose)

const adminJs = new AdminJS({
  databases: [],
  rootPath: '/admin',
  resources: [
    {
      resource: Professional,
      options: {
        properties: {
          password: { isVisible: false },
        },
        actions: {
          deleteProfessional: {
            actionType: 'record',
            icon: 'Trash',
            isVisible: true,
            handler: async (request, response, context) => {
              const { record } = context
              if (!record) {
                return {
                  notice: {
                    message: 'المهني غير موجود',
                    type: 'error',
                  },
                }
              }

              const data = record.params

              // تخزين البيانات في جدول المهنيين المحذوفين
              await DeletedProfessional.create({
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                professionField: data.professionField,
                governorate: data.governorate,
              })

              // حذف المهني
              await record.delete()

              // إرسال إيميل إشعار
              const subject = 'تم إلغاء حسابك على AskProf'
              const html = `
                <p>عزيزي/عزيزتي ${data.username}،</p>
                <p>نود إعلامك أنه تم حذف حسابك من منصة AskProf.</p>
                <p>للاستفسار، يرجى التواصل مع الإدارة.</p>
                <p>مع تحيات فريق AskProf</p>
              `

              try {
                await sendEmail(data.email, subject, html)
              } catch (err) {
                console.error('فشل في إرسال الإيميل:', err)
              }

              return {
                notice: {
                  message: 'تم حذف المهني وإرسال إشعار الإلغاء بنجاح',
                  type: 'success',
                },
              }
            },
            component: false,
          },
        },
      },
    },
    {
      resource: DeletedProfessional,
      options: {
        actions: {
          restoreProfessional: {
            actionType: 'record',
            icon: 'Undo',
            isVisible: true,
            handler: async (request, response, context) => {
              const { record } = context
              if (!record) {
                return {
                  notice: {
                    message: 'المهني المحذوف غير موجود',
                    type: 'error',
                  },
                }
              }

              const data = record.params

              // إعادة المهني
              await Professional.create({
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                professionField: data.professionField,
                governorate: data.governorate,
                password: 'تم الحذف مسبقاً', // أو ضع null إذا أردت
                confirmEmail: true,
                isApproved: false,
              })

              // حذف من جدول المهنيين المحذوفين
              await record.delete()

              return {
                notice: {
                  message: 'تم استرجاع المهني بنجاح',
                  type: 'success',
                },
              }
            },
            component: false,
          },
        },
      },
    },
  ],
  branding: {
    companyName: 'AskProf',
    softwareBrothers: false,
  },
})

const adminRouter = AdminJSExpress.buildRouter(adminJs)

export { adminJs, adminRouter }
