const crypto = require('crypto');
const mongoose=require('mongoose');
const validator= require('validator');
const bcrypt = require('bcryptjs');
var  userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name!']
    },
    email:{
        type:String,
        required:[true,'Please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            validator: function(el){
                return el === this.password
            },
            message:'Passwords are not same!'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date
});
//middlewear (saving data throgh encryption and hashing in database)
userSchema.pre('save',async function(next){
    //only run this function if password is modified
    if(!this.isModified('password')) return next();

    //hash the password with cost of 12 
    this.password=await bcrypt.hash(this.password,12);
    //delete the password confirm fields
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password')) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});
//instance methods to check password
userSchema.methods.correctPassword = async (candidatePassword ,userPassword)=>{
    return bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter= function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000, 10
        );//with base 10
         return JWTTimestamp < changedTimestamp ;
    }
    //false means not changed
    return false;
}

userSchema.methods.createPasswordResetToken = ()=>{
    //generating random token of 32 length in hexadecimal form
    const resetToken = crypto.randomBytes(32).toString('hex');
    //sha256 is algorihtm and encrypt the resetToken
    this.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

    this.passwordResetExpires = Date.now() +10*60*1000;

    return resetToken;
}

const User = mongoose.model('user',userSchema);
module.exports= User;