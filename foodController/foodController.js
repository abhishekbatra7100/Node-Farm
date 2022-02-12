const fs=require('fs');
const express=require('express');
const app=express();

const replaceTemplate = require('./../replaceTemplate');
const Food=require('./../model/foodModel');
const catchAsync= require('./../catchAsync')
const AppError = require('./../utils/appError')

const replaceName = require('./../replaceName');

//declare ObjectId from mongodb module
const ObjectId = require('mongodb').ObjectId; 
const path = require('path');
const hbs =require('hbs')
// to set view engine
// app.engine()
// app.set('views', './../views')

app.set('views', path.join(__dirname)); 
app.set("view engine","hbs");

// app.use(express.json()); //middlewear
const tempOverview = fs.readFileSync(`${__dirname}/../index.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/../template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/../template-product.html`, 'utf-8');

const handle = fs.readFileSync(`${__dirname}/../views/index.hbs`, 'utf-8');

// console.log(tempProduct);
const data = fs.readFileSync(`${__dirname}/../data.json`, 'utf-8');

const dataObj = JSON.parse(data);//cahnge data into javascript object

const cart = fs.readFileSync(`${__dirname}/../login frontend/cart/cart.html`, 'utf-8');
const cart_item= fs.readFileSync(`${__dirname}/../item.html`);

//getting particular item details
exports.getFood =catchAsync(async (req,res,next)=>{
    var id = req.params.id;       
    const product = await Food.findById(id);

    if(!product)
        next(new AppError('No Food find with that id',404))

    // const product = dataObj[req.params.id];
    const output = replaceTemplate(tempProduct, product);
    
    res.end(output);
});

//getting all food
exports.getAllFood =catchAsync(async (req,res,next) =>{ 
    const data1 =await Food.find(); 
    const cardsHtml = data1.map(el => replaceTemplate(tempCard, el)).join('');
    let tempOutput = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    const login = '[{"Login":"Login"}]';
    const obj = JSON.parse(login);
    if(!req.session.user){
        // const name = '[{"Login":"Login","display":"none"}]';
        // // var elem = document.getElementsByClassName("dropdown");
        // // elem.style.display = "none";
        // const obj = JSON.parse(name);
        const output = obj.map(el => replaceName(tempOutput,el)).join('');
        res.end(output);
    }
    else{
        const name = req.session.user;
        // var elem = document.getElementsByClassName("dropdown");
        // elem.style.display = "inline-block";
        // const login = '[{"Login":"Login","display":"inline-block"}]';
        // const obj = JSON.parse(login);
        obj[0].Login=name;
        const output = obj.map(el => replaceName(tempOutput,el)).join('');
        res.end(output);
    }
});

exports.createFood = catchAsync(async (req,res,next)=>{
        // console.log(req.body);
        const newFood =await  Food.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
               food: newFood
            }                
        });
        console.log(newFood);
});

exports.updateFood = catchAsync(async(req,res,next)=>{
    
    const food = await Food.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });

    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    });

});

exports.deleteFood = catchAsync(async(req,res) =>{
    
    const food = await Food.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
        status:'success',
        data:null
    });
});