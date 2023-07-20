const app = require('../app');
const {
  registerUserMiddlewares, loginUserMiddlewares, sendOtpMiddlewares
} = require('../Middlewares/Route-Middlewares/expressRateLimit.middleware');
const Joi = require('joi');
const {
  authenticationProcesses,
} = require('../../../sub-systems/Authentication-System/Processes/process');
const logger = require('../../../shared/src/configurations/logger.configurations');

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
