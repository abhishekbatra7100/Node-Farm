const nodemailer = require('nodemailer');

const sendMail = async options =>{
// 1) create a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD 
        }
        //activate in gmail "less secure app" option 
    });
    // 2)define the email options
    const mailOptions = {
        from : 'Abhishek Batra <cu.18bcs2237@gmail.com>',
        to: options.email,
        subject:options.subject,
        text:options.message,
        // html: 
    }
    // 3) actually send the mail via nodemailer
    await transporter.sendMail(mailOptions);
}

module.exports = sendMail ; 