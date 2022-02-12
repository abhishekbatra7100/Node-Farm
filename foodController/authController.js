const { promisify } = require('util')
const jwt= require('jsonwebtoken')
const catchAsync = require('../catchAsync')
const User = require('./../model/userModel')
const AppError = require('./../utils/appError')
const sendEmail = require('./../utils/email')
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var session = require("express-session");
const app = express();
app.use(bodyParser.json());
//to get data from form i.e. login/signup
app.use(bodyParser.urlencoded({extended: false}));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
    session({
      key: "user_sid",
      secret: "my-ultra-secure-and-ultra-long-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
          path:'/',
        expires: 100000,
      },
    })
  );
// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
  app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie("user_sid");
    }
    next();
  });

  // middleware function to check for logged-in users
exports.sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        console.log("cookies"+req.cookies.user_sid);
      res.redirect("/");
    } else {
      next();
    }
  };

//  Generating Token 
const  signToken = id=>{
    return jwt.sign({ id },process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user,statusCode,res)=>{
    const token =signToken(user._id)
    console.log(token);
    // res.status(statusCode).json({
    //     status:'Success',
    //     token:token,
    //     data:{
    //         user
    //     }
    // });
}

//  Signup
exports.signup = catchAsync( async(req,res,next)=>{
    const newUser = await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        role:req.body.role
    });
    console.log(newUser);
    createSendToken(newUser,201,res);
    req.session.user = newUser.name;//done by me 
    return res.redirect('/');//done by  me 
});

// login
exports.login = catchAsync( async(req,res,next) =>{
    const { email, password }= req.body
    // console.log(req.body.email,req.body.password);
    //check if email and password exist
    if(!email || !password ){
        return next(new AppError('Please provide email and password!',400))
    }
    //check if email exist and password is correct
    const user= await User.findOne({ email }).select('+password')
    console.log(user)
    // console.log("ID:"+user._id);
    var id = user._id;
    const correct =await user.correctPassword(password,user.password)
    if(!correct || !user)
        return next(new AppError('Incorrect email or password',401))

    //if everthing is ok then send token to the client
    createSendToken(user,200,res);
    // document.getElementsByClassName("cool-link").innerText = user.name;
    req.session.user = user.name;
    // console.log("ID:"+user._id);
    req.session.x=id;
    // console.log("id:::"+req.session.id);
    console.log(req.session);
    return res.redirect('/');
});
//logout
exports.logout =catchAsync(async (req,res,next)=>{
    req.session.destroy();
    return res.redirect('/');
}); 

//Forget Password
exports.forgetPassword = catchAsync(async(req,res,next)=>{
    //get user based on posted email
    const user = User.findOne({email:req.body.email});
    if(!user)
        return next(new AppError("There is no user with this email address"),404); 
    //generate the random token
    const resetToken= user.createPasswordResetToken();
    await user.save({validateBeforeSave:false})


    //send it to user's mail via nodemailer
    
    const resetURL =  `${req.protocol}://${req.get(
        'host'
        )}/resetPassword/${resetToken}}`;

    const message = `Forget your password? submit a patch request with your new 
        password and password confirm to :${resetURL}.\nIf you didn't forget your 
        password, Please ignore this email!`; 
    try{
        await sendEmail({
            email:user.email,
            subject:'Your password reset token (valid for 10 Mins)',
            message
        });

        res.status(200).json({
            status:'success',
            message:'Token sent to email!'

        });
    }
    catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save({validateBeforeSave:false});

        return next(new AppError('There was an error sending the email.Try again later'
                                ,500));
    }
});


//reset Password
exports.resetPassword = catchAsync(async()=>{
    // 1) get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2)if token has not been expired, and there is user ,set the new password
    if(!user){
        return next(new AppError('Token is invalid or expired',400));
    }
    user.password = req.params.password;
    user.passwordConfirm = req.params.passwordConfirm;
    user.passwordResetExpires = undefined
    user.passwordResetToken = undefined
    await user.save();
    //3)update changeAt proprty for the user
     
    //4)log the user in ,send the jwt
    createSendToken(user,200,res);
});



exports.protect= catchAsync(async(req,res,next)=>{
    //1)getting token and check of it's  there
    let token;
    console.log("Protect  :"+req.headers.authorization);
    console.log(req.headers);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);
    if(!token){
        // return res.redirect('/login');
       return next(new AppError('You are not logged in! Please login to get access'),401)
    }


    // 2)verification token
    const decoded =  await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    console.log(decoded);

    // 3)check user still exist
    const currentUser = await User.findById(decoded.id);
    if(!currentUser)
        return next(new AppError('The user belonging to this token does no longer exist',
        401)); 

    //4)check user changed password after the tooken was issued
     if(currentUser.changedPasswordAfter(decoded.iat)){
         return next('User recently changed password!, Pleaselog in again',401);
     }

    //grant access to protected routes
    req.user=currentUser;  
    next();
 });

 // Restrict to only admin 
 exports.restrictTo = (...role) =>{
     return (req,res,next)=>{
        if(!role.includes(req.user.role))
            return next(new AppError(
                'You do not have the permission to perform this action',403));
        next();
    }
 }

 exports.updatePassword = async(req,res,next)=>{
    // 1)get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2)check if current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password)))
        return next(new AppError('Your current password is wrong',401));
    // 3)if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save() 
    // 4)log user in ,send jwt
 }