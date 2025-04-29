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
        phoneNumber: {
          type: String,
          required: true,
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
      governorate: { type: mongoose.Schema.Types.ObjectId, ref: 'Governorate' },
   

},{
    timestamps:true,
});
const professionalModel=  mongoose.models.Professional|| model('Professional',professionalSchema);
export default professionalModel;