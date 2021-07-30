const { UserInputError } = require('apollo-server-express');
const sendEmail = require('../../../modules/mailer');

module.exports = async (user) => {
  const resetPasswordToken = user.generateResetToken();

  await user.save();
  const resetPasswordUrl = `${process.env.CLIENT_URL}/resetPassword/${resetPasswordToken}`;
  const message = `<h1>Você está recebendo este e-mail porque solicitou a redefinição de senha</h1>
      <h3><a href=${resetPasswordUrl}></a>${resetPasswordUrl}</h3>
    `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Redefinição de senha',
      text: message,
    });
    return user;
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new UserInputError('Cannot send forgot password email');
  }
};
