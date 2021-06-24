/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { ForbiddenError, ApolloError, UserInputError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Permission, User_Permissions, User_Workspaces } = require('../../../models');

module.exports = {
  Mutation: {
    addUserPermission: async (_, { permissionId, userId, workspaceId }, context) => {
      try {
        auth(context);
        const loggedUser = context.req.userId;
        const owner = await isWorkspaceOwner(workspaceId, loggedUser);
        if (!owner) {
          throw new ForbiddenError('Unauthorized to add permissions in this workspace');
        }
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!workspaceMember) {
          throw new ForbiddenError('User is not part of workspace');
        }

        const [permission, created] = await User_Permissions.findOrCreate({
          where: {
            userId,
            permissionId,
            workspaceId,
          },
        });

        if (!created) throw new UserInputError('User already have this permission');

        return permission;
      } catch (error) {
        throw new ApolloError('Cannot add permission for this user');
      }
    },
  },
};
