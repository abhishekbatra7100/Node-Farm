var removeCartItemButton =document.getElementsByClassName('btn-remover');
//for removing an item from the cart 
for (var i=0;i<removeCartItemButton.length;i++){
    var button = removeCartItemButton[i];
    button.addEventListener('click',removeCartItem)
}

function removeCartItem(event){
    var buttonClicked = event.target;
    //to delete an item from cart when we click
    buttonClicked.parentElement.parentElement.parentElement.remove();
    updateCart();
}

var changeQuantity = document.getElementsByClassName('cart-quanity-input');
//for change the quantity in the cart
for (var i=0;i<changeQuantity.length;i++){
    var button = changeQuantity[i];
    button.addEventListener('change',quantityChanged);
}
function quantityChanged(event){
    var input = event.target;
    if (isNaN(input.value) || input.value <= 0){
        input.value=1;
    }
    updateCart();    
}

function updateCart(){
    var cartItemConatier = document.getElementsByClassName('cartDetails')[0];
    //getting all card-items
    var cartRows = cartItemConatier.getElementsByClassName('Cart-items');
    var total =0;
    for(var i =0; i<cartRows.length;i++){
        var cartRow = cartRows[i];
        var priceElement = cartRow.getElementsByClassName('particularPrice')[0];
        var quantityElement  = cartRow.getElementsByClassName('cart-quanity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$',''));
        var quantity = quantityElement.value;
        console.log(price*quantity);
        var particularItemPrice = price*quantity;
        //updating  the particular total price
        var particularTotalPrice = cartRow.getElementsByClassName('amount')[0].innerText =' $'+particularItemPrice.toFixed(2);
        console.log("particular price total"+particularTotalPrice);
        total+= price*quantity;
    }
    document.getElementsByClassName('total-amount')[0].innerText = '$'+total.toFixed(2);
    document.getElementsByClassName('items')[0].innerText =cartRows.length +' Item';
}



