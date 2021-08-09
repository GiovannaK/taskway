/* eslint-disable arrow-body-style */
const { ForbiddenError, ApolloError, UserInputError } = require('apollo-server-errors');
const { withFilter } = require('apollo-server-express');
const auth = require('../../../middlewares/auth');
const isWorkspaceMember = require('../../../middlewares/isWorkspaceMember');
const isWorkspaceOwner = require('../../../middlewares/isWorkspaceOwner');
const { Message, User } = require('../../../models');
const { pubsub } = require('../../../modules/pubSub');
const { CREATE_MESSAGE } = require('./channels');

module.exports = {
  Query: {
    messagesPerRoom: async (_, { roomId, workspaceId }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to send messages in this room');
        }

        const messages = await Message.findAll({
          where: {
            roomId,
          },
          include: {
            association: 'messages_user',
            include: {
              association: 'profile',
            },
          },
        });

        if (!messages) {
          throw new ApolloError('Cannot show messages');
        }

        return messages;
      } catch (error) {
        throw new ApolloError('Cannot show message in this workspace', { error });
      }
    },
  },
  Mutation: {
    createMessage: async (_, {
      roomId, body, workspaceId,
    }, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const owner = await isWorkspaceOwner(workspaceId, userId);
        const workspaceMember = await isWorkspaceMember(workspaceId, userId);

        if (!owner && !workspaceMember) {
          throw new ForbiddenError('Not authorized to send messages in this room');
        }

        const message = await Message.create({
          roomId,
          userId,
          body,
        });

        if (!message) {
          throw new UserInputError('Cannot add message, verify please');
        }

        const user = await User.findOne({
          where: {
            id: userId,
          },
          include: {
            association: 'profile',
          },
        });

        pubsub.publish(CREATE_MESSAGE, {
          addMessage: {
            message,
            messages_user: user,
            profile: user.profile,
          },
        });

        return message;
      } catch (error) {
        throw new ApolloError('Cannot create message in this workspace', { error });
      }
    },
  },
  Subscription: {
    addMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(CREATE_MESSAGE),
        (payload, variables) => {
          return (payload.addMessage.message.roomId === variables.roomId);
        },
      ),
    },
  },
};
