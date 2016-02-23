- [ip-project-server](#)
        - [Installation](#)
        - [Running](#)
- [API](#)
        - [/hello/:name/](#)
        - [/register/](#)
        - [/login/](#)

# ip-project-server
Server for Integrated Project, powered by Express.js and Redis

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

### /register/
In order to register a new user account, a `POST` request should be sent, with
the following data:
```
{
    "user": desired_username_here,
    "password": desired_password_here
}
```
The server will then respond with a JSON object that looks something like this:
```
{
    "registered": 1, // Value is 1 or 0 based on whether registration was
    successful
    "auth-key": $2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra, //
    Value is an authentication key to be used in API requests
    "error": 0 // Error code, if an error occured. 0 indicates no error.
}
```
The value of the error code will be `1` if the username already exists.

### /login/
In order to log into an account, or essentially request a new authentication
token, a `POST` request should be sent with the following data:
```
{
    "user": username_here,
    "password": password_here, // Optional field if auth-key is present
    "auth-key": auth_key_here // Optional field if password is present
}
```
Using the auth-key will reset and generate a new authentication key, whereas
password will simply get the current auth-key. In either case the following data
will be returned:
```
{
    "logged_in": 1, // Value is 1 or 0 whether or not the login was successful
    "auth-key": $2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra, //
    Only present if logged_in == 1, to be used in API requests
    "error": 0 // Error code, if an error occured. 0 indicates no error.
}
```
The error codes are as follows, `1` indicates the username could not be found,
`2` indicates that the password is invalid and `3` indicates the provided
authentication key was invalid.
