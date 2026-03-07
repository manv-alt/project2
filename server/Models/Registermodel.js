
import moongoose from "mongoose";
const userSchema = new moongoose.Schema({
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
     phone: {
          type: String,
     },
     profileImage: {
          type: String,
     },
     addresses: [{
          type: moongoose.Schema.Types.ObjectId,
          ref: 'Address'
     }],
     otp: {
          type: String,
     },
     otpExpiry: {
          type: Date,
     },
     isVerified: {
          type: Boolean,
          default: false
     },
     resetOTP: {
          type: String,
     },
     resetOTPExpiry: {
          type: Date,
     },
     refreshToken: {
          type: String,
     }


})
const UserModel = moongoose.model('User', userSchema);
export default UserModel;