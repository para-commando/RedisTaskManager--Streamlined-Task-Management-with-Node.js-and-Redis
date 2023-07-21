require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');
const { v4: uuidv4 } = require('uuid');

module.exports.taskCreationProcesses = {
    createTask: async ({
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
          // Generate a unique task id using the `uuidv4()` function
          const taskId = uuidv4();
      
          // Check if the task should be assigned to someone based on the `assignTo` parameter
          if (assignTo !== 'none') {
            isAssigned = 1; // Set `isAssigned` to 1 if the task is assigned to someone
          }
      
          // Create an array `taskDetails` to store various task fields and their values
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
      
          // Store task details in Redis hash
          // Iterate through each `taskData` in `taskDetails` array and store its field and value in Redis
          for (const taskData of taskDetails) {
            await redisClient.hSet(
              `task:${title}:${taskId}`,
              taskData.fieldName,
              taskData.value
            );
          }
      
          // Assign the task to the specified category by adding the task key to the category's set in Redis
          await redisClient.sAdd(
            `category:${categoryId}:tasks`,
            `task:${title}:${taskId}`
          );
      
          // Add the task key to the "All:Tasks" set to keep track of all tasks across categories
          await redisClient.sAdd('All:Tasks', `category:${categoryId}:tasks`);
      
          // Return a success message with the task id and category id
          return {
            message: `Task id : ${taskId} created successfully under the category id: ${categoryId}`,
          };
        } catch (error) {
          // Catch any errors that occur during the execution of the code and re-throw them
          // This ensures that any errors are propagated to the caller of the function
          throw error;
        }
      },
 
};
