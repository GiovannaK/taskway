/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const { ApolloError } = require('apollo-server-errors');
const { Workspace } = require('../models');

const checkPermission = async (userId, workspaceId, permissionId) => {
  try {
    const workspace = await Workspace.findByPk(workspaceId, {
      include: {
        association: 'workspaces_permissions',
        where: {
          permissionId,
          userId,
        },
      },
    });

    if (!workspace) {
      return false;
    }

    const getPermission = workspace.workspaces_permissions[0].dataValues.permissionId;

    if (getPermission === permissionId) {
      return true;
    }

    return false;
  } catch (error) {
    throw new ApolloError('Cannot found permissions');
  }
};

module.exports = checkPermission;
