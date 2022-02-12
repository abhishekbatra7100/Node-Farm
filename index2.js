var express = require('express');
var app = express();
var PORT = 3000;

const foodRouter=require('./Routes/foodRoutes')
const AppError = require('./utils/appError')
const globalErrorhandler = require('./foodController/errorController')
var cookieParser = require("cookie-parser");
var session = require("express-session");
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


app.use(express.json());   //middlewear
app.use('/',foodRouter);

//handling unknown routes for error 
app.all('*',(req,res,next)=>{
    next(new AppError(`Cann't find ${req.originalUrl} on this server`));
})

app.use(globalErrorhandler);

module.exports =app;