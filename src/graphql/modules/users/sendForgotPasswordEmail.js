const { UserInputError } = require('apollo-server-express');
const sendEmail = require('../../../modules/mailer');

module.exports = async (user) => {
  const resetPasswordToken = user.generateResetToken();

  await user.save();
  const resetPasswordUrl = `${resetPasswordToken}`;
  const message = `<h1>Reset password</h1>
      <h3>${resetPasswordUrl}</h3>
    `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset Password',
      text: message,
    });
    return user;
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new UserInputError('Cannot send forgot password email');
  }
};
