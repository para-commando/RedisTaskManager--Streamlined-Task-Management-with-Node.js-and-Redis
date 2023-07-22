require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');
 
module.exports.searchTaskProcesses = {
  searchTaskByKeywords: async ({ searchKeyword }) => {
    try {
      // Create a pattern to match keys in Redis using the provided searchKeyword
      const patternToMatch = 'task:' + searchKeyword + '*';
  
      // Get all keys that match the specified pattern from Redis
      const getKeysMatchingPattern = await redisClient.keys(patternToMatch);
  
      // Return the list of matching keys as the search result
      return {
        message: getKeysMatchingPattern,
      };
    } catch (error) {
      // If any error occurs during the search process, throw it further
      throw error;
    }
  },
};
