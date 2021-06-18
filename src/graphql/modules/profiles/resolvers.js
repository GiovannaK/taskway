const {v4: uuid} = require('uuid')
const s3 = require('../../../modules/s3');
const {Profile} = require('../../../models');
const auth = require('../../../middlewares/auth');


let processUpload = async(file, id, context) => {
  try {
    auth(context)
    const {createReadStream, filename, mimetype, encoding} = await file
    const stream = await createReadStream()
    const {Location} = await s3.upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimetype
    }).promise();

    const profile = await Profile.findByPk(id)

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
    console.log(error);
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
        console.log('USER', profile);

        return profile

      } catch (error) {
        console.log(error);
        throw new Error('Cannot show profile')
      }
    }
  },
  Mutation: {
    singleUpload: async(_, args, context) => {
      return processUpload(args.file, args.id, context)
    },
  }
}