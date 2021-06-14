const {
  CREATE_USER,
  CONFIRM_ACCOUNT,
  LOGIN_USER,
  FORGOT_PASSWORD,
  RESET_PASSWORD} = require('../graphqlQueries/userQueries')
const server = require('../../src/server');
const {createTestClient} = require('apollo-server-testing')
const truncate = require('../utils/truncate')
const {User} = require('../../src/models')
const bcrypt = require('bcryptjs')

describe('Authentication flux', () => {
  beforeEach(async () => {
    await truncate();
  })
  it('Should register user and generate emailConfirmationToken', async () => {
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: CREATE_USER,
      variables: {
        firstName: "mytest",
        lastName: "lastnametest",
        email: "kowesor320@vvaa1.com",
        password: "testando"
      }
    })

    expect(res).toMatchSnapshot();
  })

  it('Should confirm user account', async () => {
    const password = "testando"

    const encryptedPassword = bcrypt.hashSync(password, 6)

    const user = await User.create({
      firstName: "teste1",
      lastName: "teste last",
      email: "teste@email.com",
      password: encryptedPassword,
      emailConfirmationToken: 'a783hd842fk3209akdfe09430',
      emailConfirmationExpires: Date.now() + 10 * (60 * 1000)
    })
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: CONFIRM_ACCOUNT,
      variables: {
        emailConfirmationToken: user.emailConfirmationToken,
      }
    })

    expect(res).toMatchSnapshot();
  })

  it('Should authenticate user with valid credentials', async () => {
    const password = "testando"

    const encryptedPassword = bcrypt.hashSync(password, 6)

    const user = await User.create({
      firstName: "teste1",
      lastName: "teste last",
      email: "teste@email.com",
      password: encryptedPassword,
      isVerified: true,
    })
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: LOGIN_USER,
      variables: {
        email: user.email,
        password: "testando"
      }
    })

    expect(res).toMatchSnapshot();
  })


  it('Should generate reset token', async () => {
    const password = "testando"

    const encryptedPassword = bcrypt.hashSync(password, 6)

    const user = await User.create({
      firstName: "teste1",
      lastName: "teste last",
      email: "teste@email.com",
      password: encryptedPassword,
      isVerified: true,
    })
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: FORGOT_PASSWORD,
      variables: {
        email: user.email,
      }
    })

    expect(res).toMatchSnapshot();
  })

  it('Should reset user password', async () => {
    const password = "testando"

    const encryptedPassword = bcrypt.hashSync(password, 6)

    const user = await User.create({
      firstName: "teste1",
      lastName: "teste last",
      email: "teste@email.com",
      password: encryptedPassword,
      isVerified: true,
      passwordResetToken: "are8tr8err9fjkmfjmgj9054",
      passwordResetExpires: Date.now() + 10 * (60 * 1000)
    })
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: RESET_PASSWORD,
      variables: {
        passwordResetToken: user.passwordResetToken,
        password: "testando2"
      }
    })

    expect(res).toMatchSnapshot();
  })
})