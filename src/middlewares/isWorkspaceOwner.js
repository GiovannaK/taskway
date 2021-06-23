const { ApolloError, ForbiddenError } = require('apollo-server-errors');
const { Workspace } = require('../models');

const isWorkspaceOwner = async (workspaceId, context) => {
  try {
    const { userId } = context.req;

    const workspace = await Workspace.findByPk(workspaceId);

    if (!workspace) {
      throw new ApolloError('Cannot foud workspace');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError(
        'Uanuthorized, you must be workspace owner to execute this action',
      );
    }

    return true;
  } catch (error) {
    console.log(error);
    throw new ApolloError(
      'Server Error, cannot determine if user is workspace owner ',
      { error },
    );
  }
};

module.exports = isWorkspaceOwner;
