require('dotenv').config();
const redisClient = require('../../../shared/src/configurations/redis.configurations.js');
const {
  getDynamicScriptVariablesAndConditions,
} = require('../../../shared/src/utilities/utilities.js');
module.exports.searchTaskProcesses = {
  filterTask: async (filterConditions) => {
    try {
      let variables = [];
      const conditions = [];

      // Helper function to add a filter condition to the variables and conditions arrays
      const addCondition = ({
        variableName,
        redisKeyName,
        valueToCompare,
        conditionalSymbol,
      }) => {
        // Get dynamic script variables and conditions for the provided filter condition
        const scripts = getDynamicScriptVariablesAndConditions({
          variableName,
          redisKeyName,
          valueToCompare,
          conditionalSymbol,
        });

        // Add the script variable and condition to their respective arrays
        variables.push(scripts.variable);
        conditions.push(scripts.condition);
      };

      // Check and add filter conditions for status, categoryId, priority, isAssigned, and assignTo
      // Each filter condition is added using the addCondition helper function
      if (filterConditions?.status) {
        addCondition({
          variableName: 'status',
          redisKeyName: 'status',
          valueToCompare: filterConditions.status,
          conditionalSymbol: '==',
        });
      }

      if (filterConditions?.categoryId) {
        addCondition({
          variableName: 'categoryId',
          redisKeyName: 'categoryId',
          valueToCompare: filterConditions.categoryId,
          conditionalSymbol: '==',
        });
      }
  
      if (filterConditions?.priority) {
        addCondition({
          variableName: 'priority',
          redisKeyName: 'priority',
          valueToCompare: filterConditions.priority,
          conditionalSymbol: '==',
        });
      }
  
      if (filterConditions?.isAssigned) {
        addCondition({
          variableName: 'isAssigned',
          redisKeyName: 'isAssigned',
          valueToCompare: filterConditions.isAssigned,
          conditionalSymbol: '==',
        });
      }
  
      if (filterConditions?.assignTo) {
        addCondition({
          variableName: 'assignTo',
          redisKeyName: 'assignTo',
          valueToCompare: filterConditions.assignTo,
          conditionalSymbol: '==',
        });
      }

      // Initialize variables for the results
      let result = [];
      let taskHashes = [];
      let finalCondition =
        `local hash = redis.call('HGETALL', key)` +
        '\n' +
        `table.insert(matchingHashes, hash)`; // A string to store the final condition script in Lua format

      // Check if there are variables and conditions to be applied
      if (variables.length && conditions.length) {
        // Combine variables and conditions into Lua script format
        variables = variables.join('\n');
        finalCondition = conditions.join(' and ');
        finalCondition =
              'if ' +
              finalCondition +
              ' then' +
              '\n' +
              `local hash = redis.call('HGETALL', key)` +
              '\n' +
              `table.insert(matchingHashes, hash)` +
              '\n' +
              'end' +
              '\n';
      }

      // Create the final Lua script by combining all necessary Lua commands and variables
      const luaScript = `
      local keys = redis.call('KEYS', 'task:*')
      local matchingHashes = {}
      for _, key in ipairs(keys) do
        ${variables}
         ${finalCondition}
      end
      return matchingHashes
    `;

      // Execute the Lua script using Redis's eval command to get the filtered task hashes
      result = await redisClient.eval(luaScript, 0);

      // Convert the result into a more readable format by converting task hashes to objects
      taskHashes = result.map((hash) => {
        const taskHash = hash.reduce((acc, value, index, array) => {
          if (index % 2 === 0) {
            acc[value] = array[index + 1];
          }
          return acc;
        }, {});

        return taskHash;
      });

      // Check and apply sorting to the filtered taskHashes based on priority or dueDate
      if (filterConditions?.sort) {
        // Sorting based on priority
        if (filterConditions?.sort == 'priority') {
          const hightestPriority = [];
          const highPriority = [];
          const mediumPriority = [];
          const lowPriority = [];
  
          taskHashes.forEach((element) => {
            switch (element?.priority) {
              case 'High':
                highPriority.push(element);
                break;
              case 'Highest':
                hightestPriority.push(element);
                break;
              case 'Medium':
                mediumPriority.push(element);
                break;
              case 'Low':
                lowPriority.push(element);
                break;
            }
          });
          taskHashes = [
            ...hightestPriority,
            ...highPriority,
            ...mediumPriority,
            ...lowPriority,
          ];
        }
        // Sorting based on dueDate
        else if (filterConditions?.sort == 'dueDate') {
          const len = taskHashes?.length;
          for (let i = 0; i < len - 1; i++) {
            for (let j = 0; j < len - 1 - i; j++) {
              // Compare adjacent elements
              if (taskHashes[j].dueDate < taskHashes[j + 1].dueDate) {
                // Swap elements if they are in the wrong order
                const temp = taskHashes[j];
                taskHashes[j] = taskHashes[j + 1];
                taskHashes[j + 1] = temp;
              }
            }
          }
        }
      }

      // Return the filtered and sorted taskHashes as the final result
      return {
        message: taskHashes,
      };
    } catch (error) {
      // If any error occurs during the filtering process, throw it further
      throw error;
    }
  },

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
