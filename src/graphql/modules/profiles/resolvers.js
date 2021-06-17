const {v4: uuid} = require('uuid')
const s3 = require('../../../modules/s3');
const {Profile} = require('../../../models');
const auth = require('../../../middlewares/auth');


let processUpload = async(file, id, context) => {
  try {
    console.log('>>>', console.log(file))
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
  Mutation: {
    singleUpload: async(_, args, context) => {
      return processUpload(args.file, args.id, context)
    }
  }
}