const fs=require('fs');
const express=require('express');

const login = fs.readFileSync(`${__dirname}./../login frontend/login.html`, 'utf-8');
const cart = fs.readFileSync(`${__dirname}./../login frontend/cart/cart.html`, 'utf-8');
exports.login =(req,res,next)=>{
    res.end(login)
};
exports.cart = (req,res,next)=>{
    res.send(cart);
}