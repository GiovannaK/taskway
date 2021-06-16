const {v4: uuid} = require('uuid')
const s3 = require('../../../modules/s3');
const {GraphQLUpload} = require('graphql-upload');

let processUpload = async(file) => {
  try {
    console.log(file);
    const {createReadStream, filename, mimetype, encoding} = await file;
    const stream = createReadStream()
    const {Location} = await s3.upload({
      Body: stream,
      Key: `${uuid()}${filename}`,
      ContentType: mimetype
    }).promise();

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
  UploadFile: GraphQLUpload,
  Mutation: {
    singleUpload: async(_, args) => {
      return processUpload(args.file)
    }
  }
}