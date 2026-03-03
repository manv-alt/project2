
import moongoose from "mongoose";
const tempOtpSchema = new moongoose.Schema({
   
   name: {
          type: String,
          required: true
     },

     email: {
          type: String,
          required: true,
     },
     password: {
          type: String,
          required: true
     },

     gender: {
          type: String,
          enum: ['male', 'female', 'other'],
          required: true
     },
     otp: {
          type: String,
     },
createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 
  }
})
const tempotp = moongoose.model('Otp', tempOtpSchema);
export default tempotp;