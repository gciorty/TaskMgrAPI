const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabriel@ciortea.eu',
        subject: 'Welcome to TaskApp',
        text: `Welcome to the app, ${name}.`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'gabriel@ciortea.eu',
        subject: 'Sorry to see you leaving',
        text: `We are sorry to see you leaving us, ${name}.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}