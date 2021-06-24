/* eslint-disable camelcase */
const { ApolloError } = require('apollo-server-errors');
const { User_Workspaces } = require('../models');

const isWorkspaceMember = async (workspaceId, userId) => {
  try {
    /* const { userId } = context.req; */

    const userWorkspace = await User_Workspaces.findOne({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!userWorkspace) {
      return false;
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
