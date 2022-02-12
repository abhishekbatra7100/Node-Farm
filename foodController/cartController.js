const catchAsync = require('../catchAsync');
const fs = require('fs');
const Food = require('./../model/foodModel');
const Cart = require('./../model/cartModel');
const User = require('./../model/userModel');
const replaceTemplate = require('./../replaceTemplate');
const cartLayout = fs.readFileSync(`${__dirname}./../login frontend/cart/cart.html`, 'utf-8');
const replaceTotal = require('./../replaceTotal');

const cart_item = fs.readFileSync(`${__dirname}/../item.html`, 'utf-8');
const notLoginCart = fs.readFileSync(`${__dirname}/../notLoginCart.html`, 'utf-8');

const loginEmptyCart = fs.readFileSync(`${__dirname}/../loginEmptyCart.html`, 'utf-8');

//get all cart 
exports.getCart = catchAsync(async (req, res, next) => {
  // const cartHtml = data.map(el => replaceTemplate(cart_item, el)).join('');
  // const tempOutput = cartLayout.replace('{%PRODUCT_ITEMS%}', cartHtml);
  const Total = '[{"subTotal":"0","cartLength":"0"}]';
  const obj = JSON.parse(Total);
  if(!req.session.x){
    const tempOutput = cartLayout.replace('{%PRODUCT_ITEMS%}', notLoginCart);
    const output = obj.map(el => replaceTotal(tempOutput, el)).join('');
    res.end(output);
  }
  else{
    var UserCart = await Cart.findOne({
      userId: req.session.x
    });
    var data = UserCart.cart;
    const len = data.length

    //cart is empty but login 
  if (!len) {
    const tempOutput = cartLayout.replace('{%PRODUCT_ITEMS%}', loginEmptyCart);
    const output = obj.map(el => replaceTotal(tempOutput, el)).join('');
    res.end(output);
  } else {
    const cartHtml = data.map(el => replaceTemplate(cart_item, el)).join('');
    const tempOutput = cartLayout.replace('{%PRODUCT_ITEMS%}', cartHtml);
    let sum = data.map(o => o.total).reduce((a, c) => {
      return a + c
    });
    obj[0].subTotal = sum;
    obj[0].cartLength = len;
    console.log(obj);
    const output = obj.map(el => replaceTotal(tempOutput, el)).join('');
    res.end(output);
  }
}
});

// add to cart 
exports.addToCart = catchAsync(async (req, res, next) => {
  var id = req.params.id;
  var product = await Food.findById(req.params.id); // This is product

  var UserCart = await Cart.findOne({
    userId: req.session.x
  });
  console.log({
    id,
    product,
    UserCart
  });
  if (!UserCart) {
    await Cart.create({
        userId: req.session.x,
        cart: [{
          productId: id,
          productName: product.productName,
          price: product.price,
          image: product.image,
          total: product.quantity * product.price
        }]
      })
      .then((r) => {
        res.redirect('/');
      })
      .catch((e) => {
        console.log(e);
      });
  } else {
    const product1 = {
      productId: id,
      productName: product.productName,
      price: product.price,
      image: product.image,
      total: product.quantity * product.price
    };

    const exist = UserCart.cart.filter((cur) => {
      console.log({
        product: cur.productId.toString(),
        id
      })
      return cur.productId.toString() === id
    });
    console.log(exist);
    if (exist.length > 0) exist[0].quantity += 1;
    else UserCart.cart.push(product1);


    var data = await Cart.findOneAndUpdate({
        userId: req.session.x
      }, UserCart)
      .then((r) => {
        res.redirect('/');
      })
      .catch((e) => {
        console.log(e);
      });
  }
});


exports.remove = catchAsync(async (req, res, next) => {
  var id = req.params.id;
  // console.log({id});
  var updateData = await Cart.findOneAndUpdate({
    userId: req.session.x
  }, {
    $pull: {
      cart: {
        _id: id
      }
    }
  }).exec()
  .then((r) => {
      console.log(r);
        // res.redirect();
      })
      .catch((e) => {
        console.log(e);
      });

  console.log("update DAta" + updateData);
  res.redirect('/cart');
});

exports.removeAll = catchAsync(async (req,res,next)=>{
  var updateData = await Cart.findOneAndUpdate({
    userId: req.session.x
  }, {
    $unset: { cart: ""}
  }).exec()
  .then((r) => {
      console.log(r);
        // res.redirect();
      })
      .catch((e) => {
        console.log(e);
      });
      res.redirect('/cart');
})