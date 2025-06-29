/*import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from './DB/connection.js';
import { register } from './src/modules/auth/auth.controller.js';

dotenv.config();

await connectDb();

const rawProfessionals = [
  { username: "محمد عمر", email: "m.omar1@pro.com", phoneNumber: "0599100001" },
  { username: "سعيد ناصر", email: "s.naser2@pro.com", phoneNumber: "0599100002" },
  { username: "أحمد طه", email: "a.taha3@pro.com", phoneNumber: "0599100003" },
  { username: "مازن خليل", email: "m.khalil4@pro.com", phoneNumber: "0599100004" },
  { username: "علاء حسن", email: "a.hassan5@pro.com", phoneNumber: "0599100005" },
  { username: "ياسر عبد الله", email: "y.abdullah6@pro.com", phoneNumber: "0599100006" },
  { username: "رامي سمير", email: "r.samir7@pro.com", phoneNumber: "0599100007" },
  { username: "مروان زيد", email: "m.zayd8@pro.com", phoneNumber: "0599100008" },
  { username: "فارس دياب", email: "f.diyab9@pro.com", phoneNumber: "0599100009" },
  { username: "تامر يوسف", email: "t.yousef10@pro.com", phoneNumber: "0599100010" },
  { username: "عماد جهاد", email: "e.jihad11@pro.com", phoneNumber: "0599100011" },
  { username: "وسيم شرف", email: "w.sharaf12@pro.com", phoneNumber: "0599100012" },
  { username: "قصي درويش", email: "q.darwish13@pro.com", phoneNumber: "0599100013" },
  { username: "أنس خالد", email: "a.khaled14@pro.com", phoneNumber: "0599100014" },
  { username: "زكريا حمزة", email: "z.hamza15@pro.com", phoneNumber: "0599100015" },
  { username: "ليث سميح", email: "l.sameeh16@pro.com", phoneNumber: "0599100016" },
  { username: "ضياء جودت", email: "d.joudat17@pro.com", phoneNumber: "0599100017" },
  { username: "باسل نزار", email: "b.nizar18@pro.com", phoneNumber: "0599100018" },
  { username: "كريم مأمون", email: "k.maamoun19@pro.com", phoneNumber: "0599100019" },
  { username: "مهند شاكر", email: "m.shaker20@pro.com", phoneNumber: "0599100020" },
  { username: "سامر رائد", email: "s.raed21@pro.com", phoneNumber: "0599100021" },
  { username: "شاكر أمين", email: "sh.amin22@pro.com", phoneNumber: "0599100022" },
  { username: "رامي أيوب", email: "r.ayoub23@pro.com", phoneNumber: "0599100023" },
  { username: "طارق عادل", email: "t.adel24@pro.com", phoneNumber: "0599100024" },
  { username: "أدهم منذر", email: "a.munther25@pro.com", phoneNumber: "0599100025" },
  { username: "بهاء وديع", email: "b.wadee26@pro.com", phoneNumber: "0599100026" },
  { username: "سامي عبود", email: "s.aboud27@pro.com", phoneNumber: "0599100027" },
  { username: "إياد مراد", email: "e.murad28@pro.com", phoneNumber: "0599100028" },
  { username: "عمرو نعيم", email: "a.naeem29@pro.com", phoneNumber: "0599100029" },
  { username: "هيثم ضياء", email: "h.dhia30@pro.com", phoneNumber: "0599100030" }
];

const professionals = rawProfessionals.map((p, i) => ({
  ...p,
  password: "123456789A",
  birthdate: `198${i % 10}-0${(i % 9) + 1}-15`,
  gender: "ذكر",
  usertype: "مهني",
  originalGovernorate: "طولكرم",
  professionField: "الكهربائيات"
}));

const mockResponse = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log(`Status: ${this.statusCode || 200}`, data);
  }
};

for (const prof of professionals) {
  const mockRequest = {
    body: prof,
    protocol: "http",
    headers: { host: "localhost:3000" }
  };
  await register(mockRequest, mockResponse, () => {});
}

await mongoose.disconnect();
console.log("✅ 30 electricians from Tulkarm seeded successfully.");
*/
/*import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDb from './DB/connection.js';
import professionalModel from './DB/models/professional.model.js';

dotenv.config();
await connectDb();

const tulkarmId = "680c4fbf965fc89b814234fc"; // ObjectId لمحافظة طولكرم

// جلب المهنيين من طولكرم - مجال الكهربائيات
const professionals = await professionalModel.find({
  usertype: "مهني",
  professionField: "الكهربائيات",
  originalGovernorate: tulkarmId
}).sort({ createdAt: 1 });

if (professionals.length < 30) {
  console.log(`⚠️ فقط ${professionals.length} مهنيين موجودين، نحتاج 30.`);
  process.exit(1);
}

// تعيين أول 20 كـ isApproved: true
const approved20 = professionals.slice(0, 20);
const confirmed10 = professionals.slice(0, 10);

await professionalModel.updateMany(
  { _id: { $in: approved20.map(p => p._id) } },
  { $set: { isApproved: true } }
);

await professionalModel.updateMany(
  { _id: { $in: confirmed10.map(p => p._id) } },
  { $set: { confirmEmail: true } }
);

console.log("✅ تم تعيين isApproved: true لـ 20 مهني");
console.log("✅ تم تعيين confirmEmail: true لـ 10 مهنيين فقط");

await mongoose.disconnect();*/
// seed_reviews.js
// seed_site_reviews.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDb from "./DB/connection.js";
import SiteReviewModel from "./DB/models/SiteReview.model.js";

dotenv.config();
await connectDb();

// 10 معرفات مستخدمين (يمكن تكرارهم أو إضافة مستخدمين جدد)
const userIds = [
  "6815139093fbf270d0947630", "6815649cc6a64dfd0cfe01bd", "68156c2765a2509c6d1cb492",
  "68156d0a65a2509c6d1cb4a0", "68162b2b65ddde4940dc4320", "6816a4c9faa7dc6a8ee32349",
  "68237260b40fb0265d1f3473", "6834f005f29e63245d0c0cf9", "6837b5f77b63015d91c27e3f",
  "684b44a5706163a34f0166bf"
];

const extraComments = [
  "الموقع فادني جدًا بتواصل مع مهنيين بكل سهولة 🌟",
  "أداء ممتاز وتجاوب سريع، شكرًا لكم 🙏",
  "تجربة مريحة وواضحة، أنصح الجميع باستخدامه ✅",
  "المنصة ممتازة لخدمات الصيانة والتركيبات 👨‍🔧",
  "أعجبتني خيارات التصفية وسرعة الحجز 💡",
  "خدمة رائعة وتصميم احترافي 👍",
  "واجهة المستخدم رائعة جدًا وسهلة الفهم 😊",
  "سهلت علي العثور على مهنيين بوقت قياسي ⏱️",
  "منصة فعالة وأسعار معقولة، أحسنتم 👌",
  "كل شيء واضح وسهل الاستخدام، بالتوفيق 💪"
];

function randomDateWithinWeek() {
  const now = new Date();
  return new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
}

async function seedExtraSiteReviews() {
  for (let i = 0; i < 10; i++) {
    const newReview = new SiteReviewModel({
      user: userIds[i % userIds.length], // نعيد استخدام المستخدمين إن احتجنا
      rating: 5,
      comment: extraComments[i],
      date: randomDateWithinWeek()
    });

    await newReview.save();
  }

  console.log("✅ تمت إضافة 10 تقييمات ممتازة إضافية للموقع");
  await mongoose.disconnect();
}

await seedExtraSiteReviews();