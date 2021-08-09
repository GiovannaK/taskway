const { ForbiddenError, ApolloError, UserInputError } = require('apollo-server-errors');
const auth = require('../../../middlewares/auth');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Room } = require('../../../models');

module.exports = {
  Query: {

  },
  Mutation: {
    createRoom: async (_, { workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);

        if (!owner) {
          throw new ForbiddenError('Not authorized to create a room');
        }

        const isRoomExist = await Room.findOne({
          where: {
            workspaceId,
          },
        });

        if (isRoomExist) {
          throw new UserInputError('Room already Exists');
        }

        const room = await Room.create({
          workspaceId,
        });

        if (!room) {
          throw new ApolloError('Cannot create a room in this workspace');
        }

        return !!room;
      } catch (error) {
        throw new ApolloError('Cannot create a room in this workspace', { error });
      }
    },
  },
};
