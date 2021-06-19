const auth = require('../../../middlewares/auth');
const { Workspace } = require('../../../models');

/* eslint-disable no-unused-vars */
module.exports = {
  Mutation: {
    createWorkspace: async (_, { title }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const workspace = await Workspace.create({
          ownerId: userId,
          title,
        });

        return workspace;
      } catch (error) {
        console.log(error);
        throw new Error('Workspace could not be created', { error });
      }
    },
  },
};
