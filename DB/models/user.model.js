//User Schema
import { Schema,model,mongoose } from "mongoose";
const userSchema = new Schema({
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
    bio: { 
         type: String , 
    },
    confirmEmail:{
         type: Boolean,
         default: false,
     },
    usertype:{
         type:String,
         enum:["مستخدم","مهني"],
    },
     sendCode:{
     type: String,
     default:null,
     },
     codeExpire: Date,
},{
    timestamps:true,
});
const userModel= mongoose.models.User || model('User',userSchema);
export default userModel;