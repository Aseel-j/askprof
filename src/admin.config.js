/*import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSMongoose from "@adminjs/mongoose";

import Professional from "../DB/models/professional.model.js";
import DeletedProfessional from "../DB/models/deletedProfessional.model.js";
import Governorate from "../DB/models/governorate.model.js";
import Review from "../DB/models/review.model.js";

import { sendEmail } from "../src/utils/SendEmail.js";

AdminJS.registerAdapter(AdminJSMongoose);

const adminOptions = {
  resources: [
    {
      resource: Professional,
      options: {
        properties: {
          password: { isVisible: false },
          governorate: {
            reference: "Governorate",
          },
          originalGovernorate: {
            reference: "Governorate",
          },
        },
        actions: {
          approve: {
            actionType: "record",
            icon: "Check",
            handler: async (req, res, context) => {
              const record = context.record;
              if (!record) return { record: null, notice: { message: "لم يتم العثور على المهني", type: "error" } };

              await record.update({ isApproved: true });

              await sendEmail(
                record.params.email,
                "تم قبول حسابك في Ask Professional",
                `<h1>مرحبًا ${record.params.username}</h1><p>لقد تم قبول حسابك كمحترف في المنصة. شكرًا لانضمامك إلينا!</p>`
              );

              return {
                record: record.toJSON(),
                notice: { message: "تم قبول المهني وإرسال إيميل إشعار", type: "success" },
              };
            },
            label: "قبول المهني",
            showInDrawer: false,
          },

          deleteAndArchive: {
            actionType: "record",
            icon: "Trash",
            handler: async (req, res, context) => {
              const record = context.record;
              if (!record) return { notice: { message: "لم يتم العثور على المهني", type: "error" } };

              const data = record.params;

              // إضافة المهني إلى المحذوفين
              await DeletedProfessional.create({
                username: data.username,
                email: data.email,
                anotheremail: data.anotheremail,
                phoneNumber: data.phoneNumber,
                professionField: data.professionField,
                governorate: data.governorate,
              });

              // حذف المهني من الجدول الأصلي
              await record.delete();

              // إرسال إيميل الحذف
              await sendEmail(
                data.email,
                "تم حذف حسابك من Ask Professional",
                `<h1>مرحبًا ${data.username}</h1><p>تم حذف حسابك من المنصة لأسباب إدارية. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا.</p>`
              );

              return {
                notice: { message: "تم حذف المهني وأرسلت إيميل إشعار", type: "success" },
              };
            },
            label: "حذف وأرشفة",
            showInDrawer: false,
          },
        },
      },
    },

    {
      resource: DeletedProfessional,
      options: {
        properties: {
          governorate: {
            reference: "Governorate",
          },
        },
        actions: {
          restore: {
            actionType: "record",
            icon: "Undo",
            handler: async (req, res, context) => {
              const record = context.record;
              if (!record) return { notice: { message: "لم يتم العثور على المهني المحذوف", type: "error" } };

              const data = record.params;

              await Professional.create({
                username: data.username,
                email: data.email,
                anotheremail: data.anotheremail,
                phoneNumber: data.phoneNumber,
                professionField: data.professionField,
                governorate: data.governorate,
                isApproved: false,
                password: "hashedOrDefaultPassword", // يجب معالجة كلمة المرور حسب نظامك
                birthdate: new Date(), // يجب تزويد تاريخ الميلاد أو تعديله حسب الحاجة
                gender: "ذكر", // يجب تعديل حسب الحاجة
                usertype: "مهني",
              });

              await record.delete();

              await sendEmail(
                data.email,
                "تم استرجاع حسابك في Ask Professional",
                `<h1>مرحبًا ${data.username}</h1><p>تم استرجاع حسابك في المنصة. يمكنك الآن تسجيل الدخول واستخدام خدماتنا.</p>`
              );

              return {
                notice: { message: "تم استرجاع المهني وإرسال إشعار عبر الإيميل", type: "success" },
              };
            },
            label: "استرجاع المهني",
            showInDrawer: false,
          },
        },
      },
    },

    {
      resource: Governorate,
      options: {
        properties: {
          name: { isTitle: true },
        },
      },
    },

    {
      resource: Review,
      options: {
        properties: {
          professional: {
            reference: "Professional",
          },
          user: {
            reference: "User", // تأكد أن لديك موديل User
          },
          rating: { type: "number" },
          comment: { type: "textarea" },
        },
      },
    },
  ],

  rootPath: "/admin",
};

/*const admin = new AdminJS(adminOptions);

const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (email === "admin@domain.com" && password === "admin123") {
      return { email: "admin@domain.com" };
    }
    return null;
  },
  cookieName: "adminjs",
  cookiePassword: process.env.ADMIN_COOKIE_PASS || "secret-cookie-password",
});

export { admin, router };*/

/*const admin = new AdminJS(adminOptions);

const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return null;

    const matched = await admin.comparePassword(password);
    if (matched) {
      return { email: admin.email, name: admin.name };
    }
    return null;
  },
  cookieName: "adminjs",
  cookiePassword: process.env.ADMIN_COOKIE_PASS || "secret-cookie-password",
});

export { admin, router }; */
