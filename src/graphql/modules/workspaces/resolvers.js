/* eslint-disable camelcase */
const { UserInputError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const { User_Workspaces, Workspace } = require('../../../models');

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
    addUserToWorkspace: async (_, args, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const { workspaceId } = args;
        const invitedUser = args.userId;

        const workspace = await Workspace.findOne({
          where: {
            id: workspaceId,
            ownerId: userId,
          },
        });

        if (!workspace) {
          throw new Error('Workspace does not exist');
        }

        const [addedUser, created] = await User_Workspaces.findOrCreate({
          where: {
            userId: invitedUser,
            workspaceId: workspace.id,
          },
        });

        if (!created) {
          throw new UserInputError('User already added');
        }

        return addedUser;
      } catch (error) {
        throw new Error('Cannot add User to workspace', { error });
      }
    },
  },
};
