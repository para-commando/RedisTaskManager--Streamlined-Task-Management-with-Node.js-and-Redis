require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');
 
module.exports.searchTaskProcesses = {
    searchTaskByKeywords: async () => {
        try {
         
          return {
            message: 'ola',
          };
        } catch (error) {
          throw error;
        }
      }
};
