const mongoose = require('mongoose')

const cart = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cart:[{
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'Food',
                required:true
            }, 
            productName:{
                type:String,
                required:[true,'A column have a name']
            },
            price:{
                type:Number,
                required:[true,'Price should not be empty']
            },
            quantity:{
                type:Number,
                default:1
            },
            image:{
                type:String
            },
            total:{
                type:Number
            }
        }],
        subTotal:{
            type:Number,
            default:0
        },
        cartLength:{
            type:Number,
            default:0
        }
});



module.exports = mongoose.model('Cart', cart);