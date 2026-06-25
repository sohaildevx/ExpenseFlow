import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        toLowercase:true,
    },
    password:{
        type:String,
        required:function(){ return !this.googleId; }
    },
    googleId:{
        type:String,
        default:null
    },
    avatar:{
        type:String,
        default:null
    },
    resetOtp:{
        type:String,
        default:''
    },
    resetOtpExpiry:{
        type:Number,
        default:0
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    verifyOtp:{
        type:String,
        default:''
    },
    verifyOtpExpiry:{
        type:Number,
        default:0
    },
    userType:{
        type:String,
        enum:['transport','simple'],
        required:true,
    }
},{timestamps:true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    try {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;