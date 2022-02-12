module.exports = (temp, product) => {
    let output = temp.replace(/{%Login%}/g, product.Login);
    return output;
}