# RedisTaskManager: Streamlined Task Management with Node.js and Redis

This README file provides a comprehensive and sophisticated overview of the API endpoints and their functionalities for the Node.js, Express.js, and Redis-implemented Task Management System. The project is architected as a microservices system, and it utilizes RESTful APIs, logging and monitoring, database integration, error handling, and authentication and authorization mechanisms to ensure scalability, security, and ease of maintenance.
## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Dependencies](#dependencies)
- [License](#license)

## Introduction

This is a Node.js, Express.js, and Redis-implemented task management system. It allows users to create, assign, and track tasks. The system also provides features for filtering tasks, searching for tasks, and updating task details.

The system is designed to be scalable and secure. It uses a microservices architecture to decouple the different components of the system. This makes it easy to scale the system as needed. The system also uses Redis to store session data, which helps to improve security.

The system is easy to use. The API documentation is clear and concise, and the system provides a user-friendly interface.

### Features

- Create, assign, and track tasks
- Filter tasks by category, priority, assigned person, assignment status, work status, and sorting criteria
- Search for tasks based on title keywords
- Update task details
- List all tasks under all the present categories
- List all users or those users who have not been assigned any task
- Create new task one at a time
- Reset password post otp authentication
- Register a new user
- Login an existing user

### Benefits

- Helps users to stay organized and on track
- Improves productivity
- Reduces stress
- Provides a centralized repository for tasks
- Makes it easy to collaborate with others

## Middleware

The project includes several middleware components that enhance the functionality and security of the API Gateway service:

- Response Time Middleware: Measures the response time of each request and adds it to the response headers.

- Morgan Middleware: Logs HTTP requests to the console, providing useful information for debugging and monitoring.

- Helmet Middleware: Sets various security-related HTTP headers to protect the API from common vulnerabilities.

- JWT Middleware: Handles JSON Web Token (JWT) authentication, ensuring secure access to protected routes.

- DDoS Middleware: Provides protection against Distributed Denial-of-Service (DDoS) attacks by limiting request rates.

- Body Parser Middleware: Parses incoming request bodies in JSON format, allowing easy access to request data.

Feel free to explore the individual middleware modules located in the 'Middlewares/Gateway-Middlewares' directory for more details on their implementation and usage.

## API Endpoints

The API Gateway service includes multiple endpoints that interact with various microservices. Each endpoint is associated with specific rate-limiting middleware and request processing logic. The base URL for all endpoints is `/routes/Task-Management-system/SubSystem`, and the API supports JSON data format for both request and response. Here are the details of the endpoints subsystem wise:

### Authentication-subsystem

This Subsystem contains APIs for user authentication including OTP validated userName and Password recovery option, The base URL for all the endpoints in this subsystem is `/user-Authentication/`, the details of the endPoints in this are:

### 1. `/Register-user`

- Method: POST
- Description: Creates a new user account by providing personal details in the request body. Upon successful registration, the user can use the same credentials to log in to the system.
- Parameters:
  - `userName` (string, required): The user's username.
  - `email` (string, required): The user's email address.
  - `password` (string, required): The user's password.
  - `phoneNo` (string, required): The user's phone number.
- Responses:
  - `200`: User account created successfully.
  - `409`: Conflict. Username already exists.
  - `503`: Create new user process failed. Internal error in the process layer.
- Sample Request:

```
{
  "userName": "Anirudh.Nayak",
  "email": "myMail.example@example.com",
  "password": "iWillNotTellYou9934",
  "phoneNo": "9999999999"
}
```

- ProcessLogic:

        1. Hashes the provided password using bcrypt to securely store it in the system.

        2. Checks if the provided username already exists in the system.

        3. If the username already exists, it throws a Conflict error indicating that the username is already taken.

        4. If the username is available, it saves the user's details, including the username, email, hashed password, and phone number, in the system.

        5. Additionally, it stores the username and password separately for use in the forgot password functionality.

### 2. `/login-user`

- Method: POST
- Description: Allows an existing user to log in to the system using their username and password.
- Parameters:
  - `userName` (string, required): The user's username.
  - `password` (string, required): The user's password.
- Responses:
  - `200`: User logged in successfully.
  - `400`: Bad request. Invalid password.
  - `503`: Login user process failed. Internal error in the process layer.
  - `423`: Locked. Account locked due to the maximum number of failed attempts. Try again after some time.
  - `401`: Unauthorized. Invalid username or new user.
- Sample Request:

```
{
  "userName": "Anirudh.Nayak",
  "password": "iWillNotTellYou9934"
}
```

- ProcessLogic

  1. Checks if the user's account is temporarily locked due to exceeding the maximum number of failed login attempts.

  2. If the account is locked, it throws a Locked error indicating the account is temporarily locked and suggests waiting for a certain period before attempting again.

  3. Checks if the provided username exists in the system.

  4. If the username exists, it retrieves the saved password for the corresponding user.

  5. Compares the provided password with the saved password using bcrypt for validation.

  6. If the credentials match, it indicates successful login.

  7. If the credentials do not match, it tracks the number of failed login attempts for the user.

  8. If the failed login attempts exceed the maximum allowed, it locks the account temporarily and throws a Locked error.

  9. For each failed login attempt, it increments the failed login count and sets an expiration time for the count.

#### 3. `/send-OTP`

- Method: POST
- Description: Triggers OTP authentication to an existing user if they forget their password or username.
- Parameters:
  - `phoneNo` (string, required): The user's phone number.
- Responses:
  - `201`: OTP sent successfully.
  - `401`: Unauthorized. Incorrect phone number or user does not exist.
  - `503`: Send OTP process failed. Internal error in the process layer.
- Sample Request:

```
{
  "phoneNo": "9999999999",
}
```

- Process Logic:

        1. Checks if the user exists in the system based on the provided phone number.

        2. If the user does not exist, it throws an Unauthorized error indicating incorrect phone number or non-existent user.

        3. If the user exists, it checks if an OTP has already been sent previously.

        4. If an OTP has been sent, it retrieves the previously generated OTP and its time-to-live (TTL).

        5. The process then sends the same OTP to the user's phone number along with the remaining TTL.

        6. If an OTP has not been sent previously, it generates a new OTP, stores it in the system associated with the user's phone number, and sets its TTL.

        7. Finally, it sends the newly generated OTP to the user's phone number along with the remaining TTL.
#### 4. `/verify-OTP`

- Method: POST
- Description: Authenticates the user by verifying the OTP sent earlier using the `/send-OTP` API.
- Parameters:
  - `phoneNo` (string, required): The user's phone number.
  - `otp` (string, required): The OTP received by the user.
- Responses:
  - `200`: OTP verification was successful.
  - `403`: Forbidden. Please generate a new OTP.
  - `401`: Unauthorized. Incorrect phone number or user does not exist.
  - `503`: Verify OTP process failed. Internal error in the process layer.
- Sample Request:

```
{
  "phoneNo": "9999999999",
  "otp": "829632"
}
```

- ProcessLogic:

        1. Checks if the user exists in the system based on the provided phone number.

        2. Validates if the provided OTP matches the OTP stored in the system for the user.

        3. If the OTP is valid, it indicates successful OTP verification.

        4. If the OTP does not match or the user does not exist, it throws an Unauthorized error indicating incorrect phone number, invalid OTP, or non-existent user.

        5. Additionally, it checks if the OTP has expired and sends a Forbidden error if a new OTP needs to be generated.

        6. If all conditions are met, it indicates successful OTP verification.

#### 5. `/reset-Password`

- Method: POST
- Description: Resets the user's password after OTP authentication.
- Parameters:
  - `phoneNo` (string, required): The user's phone number.
  - `userName` (string, required): The user's username.
  - `password` (string, required): The new password.
- Responses:
  - `200`: Password reset was successful.
  - `401`: Unauthorized. Incorrect phone number or user does not exist.
  - `503`: Change password process failed. Internal error in the process layer.
- Sample Request:

```
  {
  "phoneNo": "9999999999",
  "userName": "Anirudh.Nayak",
  "password": "MyNewPassword123"
  }
```

- Process Logic:

        1. Checks if the user exists in the system based on the provided phone number.

        2. Verifies if the user is allowed to change the password.

        3. Validates if the provided username exists in the system.

        4. If any of the above conditions are not met, it throws an Unauthorized error indicating invalid username/phone number or non-existent user.

        5. If all conditions are met, it securely hashes the new password using bcrypt and updates the user's password in the system.

        6. Sends a notification to the user confirming the successful password reset.

### Listing-subsystem

This Subsystem contains APIs for user authentication including OTP validated userName and Password recovery option, The base URL for all the endpoints in this subsystem is `/Listing/`, the details of the endPoints in this are:

### 1. `/list/tasks`

- Method: GET
- Description: This API is used to list all tasks under all the present categories.
- Parameters:
   None.
- Responses:
  - `200`: Tasks listed successfully.
  - `400`: Bad request.
  - `503`: listTasks process failed. Internal error in the process layer.
- sample Request:
  ```
    http://localhost:3000/routes/Task-Management-system/SubSystem/Listing/list/tasks
  ```
- ProcessLogic:

        1. Fetch all categories containing tasks from the Redis database. 

        2. Create a mapping of task IDs to their respective categories using an empty object (`taskIdMappedToCategories`).

        3. Iterate through each category obtained in the first step.

        4. For each category, fetch all task IDs stored in the current category set from Redis.

        5. For each task ID obtained in the previous step, retrieve the corresponding task details from Redis.

        6. Store the task details in an object (`taskDetailsObjects`) where keys represent the task IDs and values are the corresponding task details.

        7. Map each category to the object containing the task details for tasks within that category.
        
        8. Return an object with a `message` key containing the final result (`taskIdMappedToCategories`).

        9. Handle any errors that occur during the process and throw them for further handling in the calling code.

### 2. `/list/users`

- Method: GET
- Description: This API is used to either return all users or those users who have not been assigned any task, based on input filter condition namely 'usersWithNoTasks'
- Parameters:
   None.
- Responses:
  - `200`: users listed successfully.
  - `400`: Bad request.
  - `503`: listUsers process failed. Internal error in the process layer.
- sample Request:
  ```
  http://localhost:3000/routes/Task-Management-system/SubSystem/Listing/list/users
  ```
- ProcessLogic:

        1. The function `listUsers` is defined as an asynchronous function that takes an object with a property `userType` as its parameter.

        2. An empty array `allUserNames` is initialized to store all user names.

        3. The function checks if a specific `userType` is provided. If `userType` is truthy (not `null`, `undefined`, `false`, etc.), it executes the code block under the `if` statement. Otherwise, it executes the code block under the `else` statement.

        4. If a specific `userType` is provided, the function fetches all user names from Redis using `redisClient.sMembers('All:Users')` and stores them in the `allUserNames` array.

        5. The function uses a Lua script to find unique user names associated with tasks in Redis. The Lua script iterates over keys in the format 'task:*' and retrieves the 'assignTo' field from each hash. It stores unique user names in the `matchingHashes` array.

        6. The Lua script returns the `matchingHashes` array containing the unique user names associated with tasks.

        7. The function executes the Lua script in Redis using `redisClient.eval(luaScript, 0)`, passing the Lua script and the number of keys to be passed to the script (0 in this case).

        8. The result of the Lua script execution is stored in the `result` variable.

        9. The function filters out user names that are associated with tasks from the fetched user names using the `filter` method and the `includes` method on arrays.

        10. If no `userType` is provided, the function simply fetches all user names from Redis using `redisClient.sMembers('All:Users')`.

        11. The final list of user names is returned as the result of the function in the format `{ message: allUserNames }`.

        12. If there's an error during the execution of the function (in the `try` block), it will be caught in the `catch` block, and the error will be thrown for handling in the calling code.


## Features

- **Microservices**: The architecture is based on microservices, where each service represents a specific business functionality or feature.
- **RESTful APIs**: Each microservice exposes RESTful APIs for communication and interaction with other services.
- **Logging and Monitoring**: Built-in logging and monitoring capabilities are implemented to track service performance and troubleshoot issues.
- **Database Integration**: Services integrate with appropriate databases for data storage and retrieval.
- **Error Handling**: Error handling mechanisms are implemented to provide meaningful error messages and handle exceptions gracefully.
- **Authentication and Authorization**: Services implement authentication and authorization mechanisms to ensure secure access to resources.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
```  
   git clone https://github.com/anirudh-nayak-172k/Backend-Microservice -Architecture.git
```  

2 . Navigate to the Directory and install the dependencies:
```
    cd Backend-Microservice-Architecture
    npm install
```

3 . Run the startDev script to start the application

```    
    npm run startDev
   
```
4 . Access the APIs:
Each service exposes its own set of APIs.

5. To see the Logs:

```    
    npm run displayLogs
   
```
 6. To stop the application entirely,

```    
    npm run kill
   
```
## Directory Structure

    server
        ├── API-Gateway
        │   └── src
        │       ├── app.js
        │       ├── Microservice-Routers
        │       │   └── microserviceRouters.js
        │       └── Middlewares
        │           ├── Gateway-Middlewares
        │           │   ├── ddos.middleware.js
        │           │   ├── helmet.middleware.js
        │           │   ├── jwt.middleware.js
        │           │   ├── morgan.middleware.js
        │           │   └── responseTime.middleware.js
        │           └── Route-Middlewares
        │               └── expressRateLimit.middleware.js
        |
        ├── shared
        │   └── src
        │       ├── configurations
        │       │   ├── logger.configurations.js
        │       │   └── redis.configurations.js
        │       ├── constants
        │       │   └── constants.js
        │       ├── models
        │       │   └── models.js
        │       └── utilities
        │           └── utilities.js
        |── sub-systems
        |    ├── Microservice-1
        |    │   ├── Processes
        |    │   │   └── process.js
        |    │   └── Process-Mappers
        |    │       └── processMappers.js
        |    ├── Microservice-2
        |    │   ├── Processes
        |    │   │   └── process.js
        |    │   └── Process-Mappers
        |    │       └── processMappers.js
        |    └── Microservice-3
        |        ├── Processes
        |        │   └── process.js
        |        └── Process-Mappers
        |            └── processMappers.js
        |
        ├── ecosystem.config.js
        ├── package.json
        ├── package-lock.json

## Scripts

    npm startDev: Starts the services using PM2 in development mode.
    
    npm start: Starts the API Gateway service.
    
    npm kill: Stops all running PM2 processes.
    
    npm monitor: Monitors the PM2 processes.
    
    npm displayLogs: Displays the logs from PM2 processes.
    
    npm test: Runs the test scripts.

## Dependencies

    Express: Fast, unopinionated, minimalist web framework for Node.js.
    
    Body Parser: Node.js body parsing middleware.
    
    Bunyan: Logging library for Node.js.
    
    Bunyan Format: Human-readable bunyan log formatter.
    
    DDoS: DDoS protection middleware for Express.js.
    
    Dotenv: Loads environment variables from a .env file.
    
    Helmet: Secure your Express apps by setting various HTTP headers.
    
    Joi: Object schema validation for Node.js. 
    
    JSONWebToken: JSON Web Token implementation for Node.js.
    
    Morgan: HTTP request logger middleware for Node.js.
    
    Nodemon: Automatically restarts the server on file changes during   development.
    
    PM2: Production process manager for Node.js applications.
    
    Express Rate Limit: Rate limiting middleware for Express.js.
    
    Redis: In-memory data structure store used as a database and cache.
    
    Rate Limit Redis: Redis-based store for express-rate-limit middleware.
    
    Response Time: Express.js middleware to record response times.

## License

    This project is licensed under the MIT License.
