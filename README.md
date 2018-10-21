# Fastify project backbone for an API service

## TODO
* Set up the default logger `Pino` and replace most of the `console.log`;
* Users crud

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
* Login API;

## Project structure
* `index.js` Server entry point, the one to execute
* `server.js` Main app instance creation and configuration;
* `config.js` Configuration variables and constants grouped by the app's environment of execution (test, dev, prod);
