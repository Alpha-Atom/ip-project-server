# ip-project-server
Server for Integrated Project, powered by Express.js and Redis, listens only on HTTPS now, currently using a self-signed cert, will have to play with trust authorities on the ionic side. Also at the moment server responds to `ALL` requests, cause it's easier to do testing with `GET`, will also set up unit tests in good time. Everything in the API documentation is working as described.

![HTTPS Screenshot](http://i.imgur.com/lQHnE3V.png "HTTPS Hello World")

* [ip-project-server](#ip-project-server)
    * [Installation](#installation)
    * [Running](#running)
* [API](#api)
    * [/hello/:name/](#helloname)
    * [/register/](#userregister)
    * [/auth/](#userauth)

### Installation
Instructions are for OSX El Capitan at time of writing.

First install the Redis server:
```
brew install redis
```
Then clone this repository:
```
git clone https://github.com/Alpha-Atom/ip-project-server.git
```
And finally, install the dependencies
```
npm install
```

### Running
To run, first start Redis:
```
redis-server
```

Then start the Express framework using:
```
node index.js
```

# API

### /hello/:name/
Returns "Hello :name!" or simply "Hello World!" if no name is present. :)

### /user/register/
In order to register a new user account, a `POST` request should be sent, with
the following data:
```javascript
{
    "user": "FooBar", // Desired username goes here
    "password": "hunter2" // Desired password goes here
}
```
The server will then respond with a JSON object that looks something like this:
```javascript
{
    "registered": 1, // Value is 1 or 0 based on whether registration was successful
    "auth-key": "$2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra", // Value is an authentication key to be used in API requests
    "error": 0 // Error code, if an error occured. 0 indicates no error.
}
```
The value of the error code will be `1` if the username already exists.

### /user/auth/
In order to log into an account, or essentially request a new authentication
token, a `POST` request should be sent with the following data:
```javascript
{
    "user": "FooBar", // Username goes here
    "password": "hunter2", // Password goes here
}
```
Using this will then generate a new authentication key, **invalidating** any
existing authentication key for that account. Note that you do not need to use
/auth/ after registering as a new auth key is already generated.
```javascript
{
    "logged_in": 1, // Value is 1 or 0 whether or not the login was successful
    "auth-key": "$2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra", // Only present if logged_in == 1, to be used in API requests
    "error": 0 // Error code, if an error occured. 0 indicates no error.
}
```
The error codes are as follows, `1` indicates the username could not be found,
`2` indicates that the password is invalid and `3` indicates that the login
request was malformed.
