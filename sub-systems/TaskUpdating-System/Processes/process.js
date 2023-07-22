require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');

module.exports.taskUpdatingProcesses = {
 updateTask: async ({
  taskId,
  title,
  description,
  dueDate,
  priority,
  status,
  categoryId,
  isAssigned,
  assignTo,
}) => {
  try {
    // Check if the task is assigned or not and update the 'isAssigned' flag accordingly
    if (assignTo === 'none') {
      isAssigned = 0;
    } else {
      isAssigned = 1;
    }

    // Create an array containing task details and their respective values
    const taskDetails = [
      { fieldName: 'title', value: title },
      { fieldName: 'description', value: description },
      { fieldName: 'dueDate', value: dueDate },
      { fieldName: 'priority', value: priority },
      { fieldName: 'status', value: status },
      { fieldName: 'isAssigned', value: isAssigned },
      { fieldName: 'categoryId', value: categoryId },
      { fieldName: 'assignTo', value: assignTo },
    ];

    // Check if the task already exists in Redis by checking its key
    const doesTaskExist = await redisClient.exists(`task:${title}:${taskId}`);

    if (doesTaskExist === 1) {
      // If the task exists, fetch its current details
      const existingTaskDetails = await redisClient.hGetAll(
        `task:${title}:${taskId}`
      );

      // Update the task details in Redis hash
      for (const taskData of taskDetails) {
        await redisClient.hSet(
          `task:${title}:${taskId}`,
          taskData.fieldName,
          taskData.value
        );
      }

      // Check if the task's category has changed, and if so, update category associations
      if (existingTaskDetails.categoryId !== categoryId) {
        await redisClient.sRem(
          `category:${categoryId}:tasks`,
          `task:${title}:${taskId}`
        );
        await redisClient.sRem('All:Tasks', `category:${categoryId}:tasks`);
        await redisClient.sAdd(
          `category:${categoryId}:tasks`,
          `task:${title}:${taskId}`
        );
        await redisClient.sAdd('All:Tasks', `category:${categoryId}:tasks`);
      }

      // Return success message after task update
      return {
        message: 'Task updated successfully',
      };
    } else {
      // If the task doesn't exist, throw an error indicating it was not found
      throw { status: 404, message: 'Bad Request', error: 'Task not found' };
    }
  } catch (error) {
    // If any error occurs during the update process, throw it further
    throw error;
  }
},

};
