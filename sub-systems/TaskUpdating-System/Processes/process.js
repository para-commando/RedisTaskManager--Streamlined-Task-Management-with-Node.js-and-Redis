require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.taskUpdatingProcesses = {
  updateTask: async ({}) => {
    try {
      return {
        message: 'ola',
      };
    } catch (error) {
      throw error;
    }
  },
};
