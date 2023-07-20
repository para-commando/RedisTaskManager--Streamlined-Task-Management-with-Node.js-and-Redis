const app = require('../app');
const {
  registerUserMiddlewares, loginUserMiddlewares, sendOtpMiddlewares, verifyOtpMiddlewares, resetPasswordMiddlewares, listTaskMiddlewares, listUsersMiddlewares
} = require('../Middlewares/Route-Middlewares/expressRateLimit.middleware');
const Joi = require('joi');
const {
  listingProcesses,
} = require('../../../sub-systems/Listing-System/Processes/process');
const {
  authenticationProcesses,
} = require('../../../sub-systems/Authentication-System/Processes/process');
const logger = require('../../../shared/src/configurations/logger.configurations');

// * * Listing/Details subsystem APIs ///////////////////////////////////

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
