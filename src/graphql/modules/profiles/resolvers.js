/* eslint-disable prefer-promise-reject-errors */
const { v4: uuid } = require('uuid');
const { UserInputError } = require('apollo-server-express');
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
        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
          throw new Error('Cannot find user');
        }

        return profile;
      } catch (error) {
        throw new Error('Cannot show profile');
      }
    },
  },
  Mutation: {
    singleUpload: async (_, args, context) => processUpload(args.file, context),
    updateBio: async (_, { bio }, context) => {
      try {
        auth(context);
        const { userId } = context.req;

        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
          throw new Error('Cannot find profile');
        }

        if (bio.length < 1) {
          throw new UserInputError('Bio must have at least 1 character');
        }

        profile.bio = bio;

        await profile.save();

        return profile;
      } catch (error) {
        throw error;
      }
    },
  },
};
