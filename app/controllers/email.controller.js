exports.send = function(to, subject, message, callback){
  var nodemailer = require('nodemailer');

  var mailer = nodemailer.createTransport({
    host: 'mail.josetinoco.com',
    port: 465,
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: "titfortat@josetinoco.com",
        pass: "Fyz5XBhD"
    },
    pool: true,
    rateLimit: 1,
    maxMessages: 2
  });

  var mailContent = {
      from: 'Tit for Tat <titfortat@josetinoco.com>',
      to: to,
      subject: subject,
      html: message
  };

  mailer.sendMail(mailContent, callback);
  // Callback signature: function(error, response)

};
