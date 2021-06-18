const {v4: uuid} = require('uuid')
const s3 = require('../../../modules/s3');
const {Profile} = require('../../../models');
const auth = require('../../../middlewares/auth');


let processUpload = async(file, context) => {
  try {
    auth(context)
    const {createReadStream, filename, mimetype, encoding} = await file
    const stream = await createReadStream()
    const {Location} = await s3.upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimetype
    }).promise();

    const {userId} = context.req
    const profile = await Profile.findOne({where: {userId}})

    if(!profile){
      throw new Error('Profile not exist')
    }

    profile.imageUrl = Location

    await profile.save();

    return new Promise((resolve, reject) => {
      if(Location){
        resolve({
          mimetype,
          filename,
          encoding,
          imageUrl: Location
        })
      }else{
        reject({
          message: 'Upload failed'
        })
      }
    })
  } catch (error) {
    throw error
  }
}


module.exports = {
  Query: {
    profile: async(_, __, context) => {
      try {
        auth(context);
        const {userId} = context.req
        const profile = await Profile.findOne({where: {userId}})

        if(!profile){
          throw new Error('Cannot find user')
        }

        return profile

      } catch (error) {
        throw new Error('Cannot show profile')
      }
    }
  },
  Mutation: {
    singleUpload: async(_, args, context) => {
      return processUpload(args.file, context)
    },
    updateBio: async(_, {bio}, context) => {
      try {
        auth(context);
        const {userId} = context.req

        const profile = await Profile.findOne({where: {userId}})

        if(!profile){
          throw new Error('Cannot find profile')
        }
        profile.bio = bio

        await profile.save()

        return profile
      } catch (error) {
        throw error
      }
    }
  }
}