const sendEmail = require('../../../modules/mailer');
module.exports = async (user) => {
  const accountConfirmationToken = user.generateConfirmationToken();

    await user.save();
    const confirmationUrl = `${accountConfirmationToken}`
    const message = `<h1>Confirme sua conta</h1>
      <h3>${confirmationUrl}</h3>
    `

    try {
      await sendEmail({
        to: user.email,
        subject: 'Confirm your account',
        text: message,
      })
      return user;
    } catch (error) {
      console.log(error);
      user.emailConfirmationToken = undefined
      user.emailConfirmationExpires = undefined;
      await user.save();
      throw new UserInputError('Cannot send email activation')
    }
}