require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.taskAssignmentProcesses = {
  assignTask: async ({ userName, categoryId, taskId, title }) => {
    try {
      // Check if the task exists in Redis by constructing the key using taskId and title
      const taskExists = await redisClient.exists(`task:${title}:${taskId}`);
  
      // If the task does not exist, throw an error with status code 404 indicating "Not Found"
      if (!taskExists) {
        throw { status: 404, message: 'Bad Request', error: 'Task not found' };
      }
  
      // Check if the task is already assigned to the user
      const isTaskAlreadyPresent = await redisClient.sIsMember(
        `user:${userName}:tasks`,
        taskId
      );
  
      // If the task is already assigned to the user, throw a conflict error with status code 409
      if (isTaskAlreadyPresent) {
        throw {
          status: 409,
          message: 'Conflict',
          error: 'Task already assigned to the user',
        };
      } else {
        // If the task is not already assigned, update the task details in Redis
        // Set 'isAssigned' field to 1 to indicate that the task is now assigned
        await redisClient.hSet(`task:${title}:${taskId}`, 'isAssigned', 1);
        // Set 'assignTo' field to the username of the user the task is assigned to
        await redisClient.hSet(`task:${title}:${taskId}`, 'assignTo', userName);
        // Add the task ID to the user's set of assigned tasks
        await redisClient.sAdd(`user:${userName}:tasks`, taskId);
      }
  
      // Return a success message indicating that the task has been assigned to the user
      return {
        message: `User: ${userName} has been successfully assigned task with task id: ${taskId}`,
      };
    } catch (error) {
      // Catch any errors that occur during the execution of the code and re-throw them
      // This ensures that any errors are propagated to the caller of the function
      throw error;
    }
  },
  
};
