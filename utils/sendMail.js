var nodemailer  = require("nodemailer");
var mail_config = require("../configs/mail_config.json");

var sendMail = function (to_address, content, callback) {
    var smtpTransport = nodemailer.createTransport("SMTP", {
        host: mail_config.host,
        secureConnection:false,
        port: mail_config.port,
        tls:{
            ciphers:'SSLv3'
        }
    });
    var mailOptions = {
        from: mail_config.sender, // sender address
        to: to_address, // list of receivers
        subject: mail_config.header, // Subject line
        html: content + mail_config.footer
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
        callback(error,response);
        smtpTransport.close();
    });
};
module.exports.sendMail = sendMail;