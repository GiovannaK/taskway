const {CREATE_USER} = require('../graphqlQueries/userQueries')
const server = require('../../src/server');
const {createTestClient} = require('apollo-server-testing')
const truncate = require('../utils/truncate')

describe('Register', () => {
  beforeEach(async () => {
    await truncate();
  })
  it('Should register user', async () => {
    const serverTest = server
    const {mutate} = createTestClient(serverTest);

    const res = await mutate({
      mutation: CREATE_USER,
      variables: {
        name: "mytest",
        email: "kowesor320@vvaa1.com",
        password: "testando"
      }
    })

    expect(res).toMatchSnapshot();
  })
})