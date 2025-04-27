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
          match: /^\+[1-9]\d{1,14}$/  // هذا Regex يسمح بمقدمة دولية وأرقام فقط
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
         enum: ["ذكر", "أنثى", "غير ذلك"],
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
    role:{
         type:String,
         enum:["user","professional","ادمن"],
    },
   

},{
    timestamps:true,
});
const userModel= mongoose.models.User || model('User',userSchema);
export default userModel;