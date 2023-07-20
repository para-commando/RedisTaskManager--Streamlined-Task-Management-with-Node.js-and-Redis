const logger = require ('../../../shared/src/configurations/logger.configurations')
require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.listingProcesses = {
    listUsers: async ({ userType }) => {
        try {
          // Initialize an empty array to store all user names
          let allUserNames = [];
    
          // Check if a specific userType is provided
          if (userType) {
            // If userType is provided, fetch all user names from Redis
            allUserNames = await redisClient.sMembers(`All:Users`);
    
            // Lua script to find unique user names associated with tasks
            const luaScript = `
            local keys = redis.call('KEYS', 'task:*')
            local matchingHashes = {}
            local uniqueUserNames = {}
            for _, key in ipairs(keys) do
              local assignTo = redis.call('HGET', key, 'assignTo')
              if not uniqueUserNames[assignTo] then
                uniqueUserNames[assignTo] = true
                table.insert(matchingHashes, assignTo)
              end
            end
            return matchingHashes
          `;
    
            // Execute the Lua script in Redis to get unique user names associated with tasks
            let result = await redisClient.eval(luaScript, 0);
    
            // Filter out user names that are associated with tasks from the fetched user names
            allUserNames = allUserNames.filter((element) => !result.includes(element));
          } else {
            // If no userType is provided, fetch all user names from Redis
            allUserNames = await redisClient.sMembers(`All:Users`);
          }
    
          // Return the list of user names as the result
          return {
            message: allUserNames,
          };
        } catch (error) {
          // If there's an error, throw it for handling in the calling code
          throw error;
        }
    },
    
    listTasks: async () => {
        try {
            // Get all categories containing tasks from Redis
            const allCategoriesContainingTasks = await redisClient.sMembers(`All:Tasks`);
          
            // Object to map task IDs to their corresponding categories
            const taskIdMappedToCategories = {};
    
            // Loop through each category containing tasks
            for (const category of allCategoriesContainingTasks) {
                // Object to store task details for each task ID in the current category
                const taskDetailsObjects = {};
    
                // Get all task IDs in the current category from Redis
                const taskIds = await redisClient.sMembers(category);
    
                // Loop through each task ID in the current category
                for (const taskId of taskIds) {
                    // Get task details for the current task ID from Redis
                    taskDetailsObjects[taskId] = await redisClient.hGetAll(taskId);
                }
    
                // Map the current category to the task details for its tasks
                taskIdMappedToCategories[category] = taskDetailsObjects;
            }
    
            // Return the mapped task IDs to categories object
            return {
                message: taskIdMappedToCategories,
            };
        } catch (error) {
            // If there's an error, throw it for handling in the calling code
            throw error;
        }
    }
    
}
