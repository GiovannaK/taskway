const AWS = require('aws-sdk');
const config = require('./configAws');

module.exports = new AWS.S3(config.s3);
