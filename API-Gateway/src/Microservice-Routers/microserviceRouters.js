const app = require('../app');
const {
  registerUserMiddlewares, loginUserMiddlewares, sendOtpMiddlewares, verifyOtpMiddlewares, resetPasswordMiddlewares, listTaskMiddlewares, listUsersMiddlewares, taskDetailsMiddlewares, createTaskMiddlewares, assignTaskMiddlewares, updateTaskMiddlewares, searchTaskMiddlewares
} = require('../Middlewares/Route-Middlewares/expressRateLimit.middleware');
const Joi = require('joi');
const {
  listingProcesses,
} = require('../../../sub-systems/Listing-System/Processes/process');
const {
  authenticationProcesses,
} = require('../../../sub-systems/Authentication-System/Processes/process');
const {
  taskCreationProcesses,
} = require('../../../sub-systems/TaskCreation-System/Processes/process');
const {
  taskAssignmentProcesses,
} = require('../../../sub-systems/TaskAssignment-System/Processes/process');
const {
  taskUpdatingProcesses,
} = require('../../../sub-systems/TaskUpdating-System/Processes/process');
const logger = require('../../../shared/src/configurations/logger.configurations');


// * * Search Task subsystem APIs ///////////////////////////////////

app.get(
  '/routes/Task-Management-system/SubSystem/SearchTask/search-task',
  searchTaskMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        searchKeyword: Joi.string().trim().max(255).required(),
      });
      const validatedData = schema.validate({
        searchKeyword: req.query.searchKeyword,
      });
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { searchKeyword } = validatedData.value;
        const response = await searchTaskProcesses.searchTaskByKeywords({
          searchKeyword: searchKeyword,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);

// * * Task Updating subsystem APIs ///////////////////////////////////

app.put(
  '/routes/Task-Management-system/SubSystem/Updating/update-task',
  updateTaskMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        title: Joi.string().trim().max(255).required(),
        description: Joi.string().trim().required(),
        dueDate: Joi.string().isoDate().required(),
        priority: Joi.string()
          .valid('Highest', 'High', 'Medium', 'Low')
          .required(),
        status: Joi.string()
          .valid('Not Started', 'In Progress', 'Completed', 'Unassigned')
          .required(),
        categoryId: Joi.string()
          .valid(
            'Work',
            'Personal',
            'Health',
            'Finance',
            'Education',
            'Errands',
            'Home',
            'Social',
            'Fitness',
            'Hobbies',
            'Travel',
            'Projects',
            'Family',
            'Shopping',
            'Goals'
          )
          .required(),
        isAssigned: Joi.string().valid('0').required(),
        assignTo: Joi.string().min(3).max(30).required(),
        taskId: Joi.string()
          .pattern(
            new RegExp(
              '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
            )
          )
          .required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const {
          title,
          description,
          dueDate,
          priority,
          status,
          categoryId,
          isAssigned,
          assignTo,
          taskId,
        } = validatedData.value;
        const response = await taskUpdatingProcesses.updateTask({
          title: title,
          description: description,
          dueDate: dueDate,
          priority: priority,
          status: status,
          categoryId: categoryId,
          isAssigned: isAssigned,
          assignTo: assignTo,
          taskId: taskId,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);



// * * Assign Task subsystem APIs ///////////////////////////////////

app.post(
  '/routes/Task-Management-system/SubSystem/TaskAssignment/Assign-task/:categoryId',
  assignTaskMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        userName: Joi.string().trim().max(255).required(),
  
        categoryId: Joi.string()
          .valid(
            'Work',
            'Personal',
            'Health',
            'Finance',
            'Education',
            'Errands',
            'Home',
            'Social',
            'Fitness',
            'Hobbies',
            'Travel',
            'Projects',
            'Family',
            'Shopping',
            'Goals'
          )
          .required(),
        taskId: Joi.string()
          .pattern(
            new RegExp(
              '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
            )
          )
          .required(),
        title: Joi.string().trim().max(255).required(),
      });
      req.body.categoryId = req.params.categoryId;
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { userName, categoryId, taskId, title } = validatedData.value;
        const response = await taskAssignmentProcesses.assignTask({
          userName: userName,
          categoryId: categoryId,
          taskId: taskId,
          title: title,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);


// * * Create Task subsystem APIs ///////////////////////////////////

app.post(
  '/routes/Task-Management-system/SubSystem/TaskCreation/create-task/:categoryId',
  createTaskMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        title: Joi.string().trim().max(255).required(),
        description: Joi.string().trim().required(),
        dueDate: Joi.string().isoDate().required(),
        priority: Joi.string()
          .valid('Highest', 'High', 'Medium', 'Low')
          .required(),
        status: Joi.string()
          .valid('Not Started', 'In Progress', 'Completed', 'Unassigned')
          .required(),
        categoryId: Joi.string()
          .valid(
            'Work',
            'Personal',
            'Health',
            'Finance',
            'Education',
            'Errands',
            'Home',
            'Social',
            'Fitness',
            'Hobbies',
            'Travel',
            'Projects',
            'Family',
            'Shopping',
            'Goals'
          )
          .required(),
        isAssigned: Joi.string().valid('0').required(),
        assignTo: Joi.string().min(3).max(30).required(),
      });
      // used path parameter
      req.body.categoryId = req.params.categoryId;
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const {
          title,
          description,
          dueDate,
          priority,
          status,
          categoryId,
          isAssigned,
          assignTo,
        } = validatedData.value;
        const response = await taskCreationProcesses.createTask({
          title: title,
          description: description,
          dueDate: dueDate,
          priority: priority,
          status: status,
          categoryId: categoryId,
          isAssigned: isAssigned,
          assignTo: assignTo,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);



// * * Listing/Details subsystem APIs ///////////////////////////////////

app.get(
  '/routes/Task-Management-system/SubSystem/Listing/task/details',
  taskDetailsMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        taskId: Joi.string()
          .pattern(
            new RegExp(
              '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
            )
          )
          .required(),
        title: Joi.string().trim().max(255).required(),
      });
      const validatedData = schema.validate({
        taskId: req.query.taskId,
        title: req.query.title,
      });
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { taskId, title } = validatedData.value;
         const response = await listingProcesses.getTaskDetails({
          taskId: taskId,
          title: title,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
     } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);

app.get(
  '/routes/Task-Management-system/SubSystem/Listing/list/tasks',
  listTaskMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      
         const response = await listingProcesses.listTasks( );
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
     } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);

app.get(
  '/routes/Task-Management-system/SubSystem/Listing/list/users',
  listUsersMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        userType: Joi.string().valid('usersWithNoTasks').default(null),
      });
      const validatedData = schema.validate({
        userType: req.query.userType,
      });
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { userType } = validatedData.value;
         const response = await listingProcesses.listUsers({
          userType: userType,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
     } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);

// * * Authentication subsystem APIs ///////////////////////////////////


app.post(
  '/routes/Task-Management-system/SubSystem/user-Authentication/reset-Password',
  resetPasswordMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        phoneNo: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
        userName: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(8).max(30).required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { phoneNo, userName, password } = validatedData.value;
        const response = await authenticationProcesses.changePassword({
          userName: userName,
          password: password,
          phoneNo: phoneNo,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);
app.post(
  '/routes/Task-Management-system/SubSystem/user-Authentication/verify-OTP',
  verifyOtpMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        phoneNo: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
        otp: Joi.string().pattern(new RegExp('^[0-9]{6}$')).required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { phoneNo, otp } = validatedData.value;
        const response = await authenticationProcesses.verifyOtp({
          phoneNo: phoneNo,
          otp: otp,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);
app.post(
  '/routes/Task-Management-system/SubSystem/user-Authentication/send-OTP',
  sendOtpMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        phoneNo: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { phoneNo } = validatedData.value;
        const response = await authenticationProcesses.sendOtp({
          phoneNo: phoneNo,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');
      res.status(400).json({ error: error });
    }
  }
);

app.post(
  '/routes/Task-Management-system/SubSystem/user-Authentication/login-user',
  loginUserMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        userName: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(8).max(30).required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { userName, password } = validatedData.value;
        const response = await authenticationProcesses.loginUser({
          userName: userName,
          password: password,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');

      res.status(400).json({ error: error });
    }
  }
);

app.post(
  '/routes/Task-Management-system/SubSystem/user-Authentication/register-user',
  registerUserMiddlewares.expressRateLimiterMiddleware,
  async (req, res, next) => {
    try {
      const schema = Joi.object({
        userName: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(8).max(30).required(),
        email: Joi.string().email().required(),
        phoneNo: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
      });
      const validatedData = schema.validate(req.body);
      if (validatedData?.error) {
        throw {
          status: 400,
          message: 'Bad Request',
          error: validatedData?.error,
        };
      } else {
        const { userName, email, password, phoneNo } = validatedData.value;
        const response = await authenticationProcesses.createNewUser({
          userName: userName,
          email: email,
          password: password,
          phoneNo: phoneNo,
        });
        logger.info('🚀response: ', response);
        res.status(200).json({
          responseData: response,
        });
      }
    } catch (error) {
      logger.error('This is an error message.');

      res.status(400).json({ error: error });
    }
  }
);
 

app.listen(3000, () => {
  console.log('listening on port 3000');
});
