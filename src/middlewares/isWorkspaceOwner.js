const { ApolloError } = require('apollo-server-errors');
const { Workspace } = require('../models');

const isWorkspaceOwner = async (workspaceId, userId) => {
  try {
    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new ApolloError('Cannot foud workspace');
    }

    if (workspace.ownerId !== userId) {
      return false;
    }

    return true;
  } catch (error) {
    throw new ApolloError(
      'Server Error, cannot determine if user is workspace owner ',
      { error },
    );
  }
};

module.exports = isWorkspaceOwner;
