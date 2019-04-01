# Fastify project backbone for an API service

## TODO
* Set up the default logger `Pino` and replace most of the `console.log`;
* Check on all config required options before boot;
* Swagger integration and config for existing API;

## Requirements
* Raccomended Node.js `>= 9.11.x`, but should work with `>= 8.6.x`;
* MongoDB `>= 3.6`;

## Useful links
* [Fastify docs](https://www.fastify.io/)
* [Node.js official MongoDb driver](http://mongodb.github.io/node-mongodb-native/3.1/)

## Installation
* Download source code, `git clone` it's fine;
* Delete `.git` if cloned;
* Install dependencies with `npm install`;
* Overwrite the base configuration inside `./config.js`;
* Add and overwrite any code you need to.
* Run with `node index.js`.

## What's included
* `MongoDB` connection to env-based database;
* Authentication middleware with `JWT`;
* Authorization middleware, based on user's role;
* Registration flow with account confirmation through email;
* Login API with token;
* User's CRUD;
* Setting's CRUD;

## Project structure
* `index.js`: server entry point, the one to execute
* `server.js`: main app instance creation and configuration;
* `config.js`: configuration variables and constants grouped by the app's environment of execution (test, dev, prod);
* `src/resources/`: API resources, a folder for each one containing _schema_, _controller_, _database migration_, ecc...;
* `src/services/`: misc services or utility functions;
* `src/emailTemplates/`: html templates, used in the emails for instance.


### Registration flow
1. A user can register an account with  `/api/v1/registration`;
2. An email will be sent to the provided address with a confirmation link with the following format `[server-address]/confirmation/:token`;
3. The token should be included in the body of an additional request to `POST /api/v1/confirm-registration`;
4. The `token` is a `JWT` token with an expiration period of __2 days__ containing the email of the account to confirm.
5. The confirmation email can be re-sent any time using `/api/v1/resend-confirmation`;
6. A non confirmed user can login in, but he won't see most of the data/resources;
7. A password recovery can be requested by a user with a confirmed account, using `/api/v1/password-recover`, which returns a recover token;
8. The new password can be recovered/updated from `/api/v1/confirm-password-recover`, using the previous recover token.

### Users
Every user has a role that determines the his capabilities. The roles list can be found in the config file (`config.js` in the project root).
* __Every__ operation except the personal profile information requires a confirmed account;
* The __update__ operation, used to edit a user personal informations, can only be performed by _admins_ towards a profile that is not the same as the user making the request (there's a specific api for that) and that has a role lower than the user making the request. Also the new role (if it is provided) cannot be higher that the one of the user making the request;
* The __delete__ operation, used to delete a user account, can only be performed by _admins_ towards a profile that is not the same as the user making the request (there's a specific api for that) and that has a role lower than the user making the request;
* The __list__ operation, used to list all the users account, can only be performed by _admins_ and it shows only the users with a role that is lower than the role of the user making the request;
* The __details__ operation, used to get a single user infos, can only be performed by _admins_ and it shows only the users with a role that is lower than the role of the user making the request;
* The __creation__ operation, used to create a new account, can only be performed by _admins_ and it can only create account with a role lower than the one of the user making the request;
* The __me__ operation returns the profile of the user making the request;
* The __updateMe__ operation updates the personal informations of the user making the request;
* The __updateMePassword__ operation updates the password of the user making the request;
* The __invalidateTokens__ operation updates the `tokenMinValidity` field in order to create a tokens blacklist.

### Settings
General website settings, can be use for multiple purposes
* __Every__ operation can only be performed by a superadmin.
* The __details__ operation returns all the saved settings data;
* The __update__ operations edits and updates the settings data with the new one provided.