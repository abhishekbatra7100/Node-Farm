module.exports = (temp, product) => {
    let output = temp.replace(/{%subTotal%}/g, product.subTotal);
    output  = output.replace(/{%cartLength%}/g,product.cartLength);
    return output;
}