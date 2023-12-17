const nodemailer = require("nodemailer")

const mailHelper = async (option) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const message = {
        from: 'yashincrypto5@gmail.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    }

    await transporter.sendMail(message);

    console.log("Message sent successfully");
}

module.exports = mailHelper