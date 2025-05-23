import { Schema,model ,mongoose} from "mongoose";
const professionalSchema = new Schema({
username: {
     type: String, 
     required: true ,
     min :3,
     max: 50,
     },
email: {
     type: String,
     required: true,
     unique: true,
     },
anotheremail: {
     type: String,
      default: null
     },
phoneNumber: {
     type: String,
     required: true,
     unique: true,
     },
password: { 
     type: String,
     required: true 
     },
birthdate: {
     type: Date,
     required: true
     },
gender: {
     type: String,
     enum: ["ذكر", "أنثى"],
     required: true 
        },
profilePicture: {
     type: Object,
         }, 
video: {
     type: Object, // Video URL or link
     },
bio: { 
     type: String , 

    },
description: {
     type: String, // Description about the professional
        
     },
confirmEmail:{
     type: Boolean,
     default: false,
    },
usertype: {
     type:String,
     enum:["مستخدم","مهني"],
    },
isApproved: {
     type: Boolean,
     default: false,
     },
originalGovernorate: {
    type: Schema.Types.ObjectId,
    ref: "Governorate",
    default: null,
  },
governorate: {
     type:Schema.Types.ObjectId,
     ref: 'Governorate' ,
     
     },
city:{
     type: String,
     default:null,
},
sendCode:{
     type: String,
     default:null,
     },

professionField: {
    type: String,
    enum:["التكنولوجيا","الكهربائيات","ورشات البناء"],
    required: true, // اجعلها غير مطلوبة إن أردت
  },

   

},{
    timestamps:true,
});
// إذا لم يتم تحديد المحافظة، اجعلها تساوي المحافظة الأصلية
professionalSchema.pre("save", function (next) {
  if (!this.governorate && this.originalGovernorate) {
    this.governorate = this.originalGovernorate;
  }
  next();
});

const professionalModel=  mongoose.models.Professional|| model('Professional',professionalSchema);
export default professionalModel;