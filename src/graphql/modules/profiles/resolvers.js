const {v4: uuid} = require('uuid')
const s3 = require('../../../modules/s3');
const {Profile} = require('../../../models');


let processUpload = async(file, id) => {
  try {
    console.log(file);
    const {createReadStream, filename, mimetype, encoding} = await file;
    const stream = createReadStream()
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
    singleUpload: async(_, args) => {
      return processUpload(args.file, args.id)
    }
  }
}