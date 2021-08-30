/* eslint-disable import/prefer-default-export */
/* const { PubSub } = require('apollo-server-express'); */

const { RedisPubSub } = require('graphql-redis-subscriptions');

exports.pubsub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retryStrategy: (options) => Math.max(options.attempt * 100, 3000),
  },
});
