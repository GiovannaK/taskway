const { UserInputError } = require('apollo-server-express');
const sendEmail = require('../../../modules/mailer');

module.exports = async (user) => {
  const accountConfirmationToken = user.generateConfirmationToken();

  await user.save();
  const confirmationUrl = `${process.env.CLIENT_URL}/activateAccount/${accountConfirmationToken}`;
  const message = `<h1>Confirme sua conta</h1>
      <h3><a href=${confirmationUrl}></a>${confirmationUrl}</h3>
    `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Ative sua conta',
      text: message,
    });
    return user;
  } catch (error) {
    user.emailConfirmationToken = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();
    throw new UserInputError('Cannot send email activation');
  }
};
