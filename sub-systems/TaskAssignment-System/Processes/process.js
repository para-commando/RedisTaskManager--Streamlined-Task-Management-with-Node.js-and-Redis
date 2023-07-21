require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.taskAssignmentProcesses = {
  assignTask: async () => {
    try {
      return {
        ola: 'ola'
      };
    } catch (error) {
      throw error;
    }
  },
  
};
