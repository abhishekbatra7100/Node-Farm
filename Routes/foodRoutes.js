const express = require('express');
const router = express.Router();
const app=express();
const foodControler = require('./../foodController/foodController.js');
const authController = require('./../foodController/authController');
const frontEndController = require('./../foodController/frontEndController');

const cartController = require('./../foodController/cartController');

const { route } = require('../index2.js');
const bodyParser =require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended : false })
app.use(urlEncodedParser);
app.use(bodyParser.json()); //middlewear
const hbs= require("hbs");
// to set view engine 
app.set("view engine","handlebars");


router
    .route('/')
    .get(foodControler.getAllFood)
    //.get(authController.protect, foodControler.getAllFood)
    .post( foodControler.createFood);

router
    .route('/product/:id')
    .get(foodControler.getFood)
    .patch(foodControler.updateFood)
    .delete(authController.protect,authController.restrictTo('admin'),foodControler.deleteFood);

router.post('/signup',urlEncodedParser,authController.signup);

router
    .route('/login')
    .get(authController.sessionChecker,frontEndController.login)
    .post(urlEncodedParser,authController.login);

router.get('/logout',authController.logout);    

//to go on cart 
// router.get('/cart',frontEndController.cart);

router.get('/cart',cartController.getCart);
router
    .route('/add-to-cart/:id')
    .get(cartController.addToCart);

router
    .route('/cart/remove/:id')
    .get(cartController.remove);

router
    .route('/cart/removeAll')
    .get(cartController.removeAll);
router.post('/forgetPassword',authController.forgetPassword);

router.patch('/resetPassword/:token',authController.resetPassword);

router.patch('/updateMyPassword',authController.protect,authController.updatePassword);
    

module.exports =router;
