/* eslint-disable camelcase */
const { ApolloError, ForbiddenError } = require('apollo-server-errors');
const { User_Workspace } = require('../models');

const isWorkspaceMember = async (workspaceId, context) => {
  try {
    const { userId } = context.req;

    const userWorkspace = await User_Workspace.findOne({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!userWorkspace) {
      throw new ForbiddenError('User not authorized to access this workspace');
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new ApolloError(
      'Server Error, cannot determine if user is workspace member ',
      { error },
    );
  }
};

module.exports = isWorkspaceMember;
