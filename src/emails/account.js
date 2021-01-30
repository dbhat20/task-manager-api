const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'myemail@email.com',
        subject: 'Thanks for joining in!',
        text: 'Welcome to the app, ${name}. Let me know how it goes'
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'myemail@email.com',
        subject: 'Sorry to see you go',
        text: 'We are sorry to see you go, ${name}. Is there anything we could have done to keep you?'
    })
}

// sgMail.send(msg).then(() => {
//     console.log('Message sent')
// }).catch((error) => {
//     console.log(error.response.body)
// })

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
