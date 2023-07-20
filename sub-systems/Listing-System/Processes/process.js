const logger = require ('../../../shared/src/configurations/logger.configurations')
require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.listingProcesses = {
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
