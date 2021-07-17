/* eslint-disable prefer-promise-reject-errors */
const { v4: uuid } = require('uuid');
const { UserInputError, ApolloError } = require('apollo-server-express');
const s3 = require('../../../modules/s3');
const { Profile } = require('../../../models');
const auth = require('../../../middlewares/auth');

const processUpload = async (file, context) => {
  try {
    auth(context);

    if (!file) {
      throw new UserInputError('Please upload an image');
    }

    const {
      createReadStream, filename, mimetype, encoding,
    } = await file;

    if (!(mimetype === 'image/png' || mimetype === 'image/jpeg' || mimetype === 'image/jpg')) {
      return new UserInputError('Please, Provide correct image type');
    }

    const stream = await createReadStream();
    const { Location } = await s3.upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimetype,
    }).promise();

    const { userId } = context.req;
    const profile = await Profile.findOne({ where: { userId } });

    if (!profile) {
      throw new Error('Profile not exist');
    }

    profile.imageUrl = Location;

    await profile.save();

    return new Promise((resolve, reject) => {
      if (Location) {
        resolve({
          mimetype,
          filename,
          encoding,
          imageUrl: Location,
        });
      } else {
        reject({
          message: 'Upload failed',
        });
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Query: {
    profile: async (_, __, context) => {
      try {
        auth(context);
        const { userId } = context.req;
        const profile = await Profile.findOne(
          {
            where: {
              userId,
            },
            include: {
              association: 'user',
            },
          },
        );

        if (!profile) {
          throw new Error('Cannot find user');
        }

        return profile;
      } catch (error) {
        throw new Error('Cannot show profile', { error });
      }
    },
  },
  Mutation: {
    singleUpload: async (_, args, context) => processUpload(args.file, context),
    updateProfile: async (_, {
      bio, firstName, lastName, email,
    }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const profile = await Profile.findOne(
          {
            where: {
              userId,
            },
            include: {
              association: 'user',
            },
          },
        );

        if (!profile) {
          throw new ApolloError('Cannot find profile');
        }

        if (firstName.length < 3 || lastName.length < 3 || email.length < 3) {
          throw new UserInputError('Check if all information is correct');
        }

        profile.bio = bio;
        profile.user.firstName = firstName;
        profile.user.lastName = lastName;
        profile.user.email = email;

        await profile.save();
        await profile.user.save();

        return profile;
      } catch (error) {
        throw new ApolloError('Cannot update profile', { error });
      }
    },
  },
};
