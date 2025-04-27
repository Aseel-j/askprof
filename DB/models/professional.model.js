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
    role:{
         type:String,
         enum:["user","professional","ادمن"],
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