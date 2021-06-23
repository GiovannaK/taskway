/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { Permission, User_Permissions, User_Workspaces } = require('../../../models');

module.exports = {
  Mutation: {
    addUserPermission: async (_, { permissionId, userId, workspaceId }, context) => {
      try {
        const isWorkspaceMember = await User_Workspaces.findOne({
          where: {
            workspaceId,
            userId,
          },
        });

        return isWorkspaceMember;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
