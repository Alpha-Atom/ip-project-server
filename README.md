# ip-project-server

[![forthebadge](http://forthebadge.com/images/badges/uses-badges.svg)](http://forthebadge.com)

Server for Integrated Project, powered by Express.js and Redis, listens only on HTTPS now, currently using a self-signed cert, will have to play with trust authorities on the ionic side. Also at the moment server responds to `ALL` requests, cause it's easier to do testing with `GET`, will also set up unit tests in good time. Everything in the API documentation is working as described.

![HTTPS Screenshot](http://i.imgur.com/lQHnE3V.png "HTTPS Hello World")

* [ip-project-server](#ip-project-server)
    * [Installation](#installation)
    * [Running](#running)
* [API](#api)
    * __Misc__
        * [/hello/:name/](#helloname)
    * __User__
        * [/user/register/](#userregister)
        * [/user/auth/](#userauth)
        * [/user/view/](#userview)
        * [/user/view/:user](#userviewuser)
    * __Society__
        * [/society/create/](#societycreate)
        * [/society/view/](#societyview)
        * [/society/view/:society\_name](#societyviewsociety_name)
        * [/society/view/:society\_name/events](#societyviewsociety_nameevents)
        * [/society/join/](#societyjoin)
        * [/society/leave/](#societyleave)
    * __Events__
        * [/events/create/](#eventscreate)
        * [/events/view/:eventid](#eventsvieweventid)
        * [/events/pending/](#eventspending)
        * [/events/accept/:eventid](#eventsaccepteventid)
        * [/events/decline/:eventid](#eventsdeclineeventid)

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
Returns "Hello :name!" or simply "Hello World!" if no name is present. Useful
for checking if the server is running :)

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
The value of the error code will be `1` if the username already exists, and `2`
if the request was malformed.

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
The error codes are as follows, `1` indicates the username or password was
invalid and `2` indicates that the login request was malformed.

### /user/view/
To view all the public information for all users at once, a `GET` request should
be sent with no data, and the returned response will look like this:
```javascript
{
    "users": [
        {
            "username": "test1",
            "societies": [
                "TestSociety2"
            ],
            "friends": [],
            "accepted_events": []
        },
        {
            "username": "test2",
            "societies": [
                "TestSociety2"
            ],
            "friends": [],
            "accepted_events": []
        },
        { ... } // More items here
    ]
}
```
There are no error codes for this route.

### /user/view/:user
To view the public information for any given `:user`, a `GET` request should be
sent with no data, and the returned response will look like this:
```javascript
{
    "user": {
        "username": "test1",
        "societies": [
            "TestSociety2"
        ],
        "friends": [],
        "accepted_events": []
    },
    "error": 0
}
```
The error codes are as follows, `1` indicates that the user does not exist.

### /society/create/
To create a new society, a `POST` request should be sent with the following
data:
```javascript
{
    "society": "FooBarSociety", // The name of the society to be created.
    "admins": ["FooBar", "BarFoo", "FarBoo"], // List of initial admins to be added, this list MUST include the user creating the society
    "description": "A description of the FooBarSociety society.",
    "auth": "$2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra"
}
```
If the society does not already exist, the new values will be added to the
database and a response will be sent looking like this:
```javascript
{
    "success": 1, // Indicates if a society was successfully created.
    "society": {
        "name": "FooBarSociety",
        "admins": ["FooBar", "BarFoo", "FarBoo"],
        "description": "A description of the FooBarSociety society.",
        "users": ["FooBar", "BarFoo", "FarBoo"] // At this point the users will simply be the admin list
    }, // An object representing the society
    "error": 0
}
```
The error codes are as follows, `1` indicates a malformed request, `2` indicates
that a society with that name already exists, and `3` indicates that the user
does not have authorisation to create that society. (Note that the admin list
must contain the username that is creating it.)

### /society/view/
To view a list of all the societies, a `GET` request should be sent with no data
to this route with no parameter. The response will be formed as follows:
```javascript
{
    "societies": [
        {
            "name": "TestSociety",
            "admins": [
                "test1",
                "test2"
            ],
            "description": "This is a test",
            "users": [
                "test1",
                "test2"
            ]
        },
        {
            "name": "TestSociety2",
            "admins": [
                "test1",
                "test2"
            ],
            "description": "This is a test",
            "users": [
                "test1",
                "test2"
            ]
        }
    ]
}
```
There are no error codes for this route.

### /society/view/:society\_name
To view a created society, :society\_name, a `GET` request should be sent with
no data. The response will then be formed as follows:
```javascript
{
    "society": { // Society object containing information about the society
        "name": "FooBarSociety",
        "admins": ["FooBar", "BarFoo", "FarBoo"],
        "description": "A description of the FooBarSociety society.",
        "users": ["FooBar", "BarFoo", "FarBoo"]
    },
    "error": 0 // Error code if an error occured, 0 indicates no error.
}
```
The error codes are as follows, `1` indicates that the society does not exist.

### /society/view/:society\_name/events
To view all the events for a society, :society\_name, a `GET` request should be
sent with the following data:
```javascript
{
  "auth": "$2a$10$ruuu6QfYLjW1QKOwONVvkelXuh8EVFyug/kJvfaTNL0aXNGyODZ9K"
}
```
Then the server will respond like this:
```javascript
{
  "events": [
    {
      "name": "Super Mario Kart Party",
      "location": "Marioland",
      "society": "TestSociety",
      "start": "14605026110490",
      "end": "14605026110500",
      "details": "Play some Mario Kart with us",
      "organiser": "test1"
    },
    {
      "name": "Super Mario Kart Party 2",
      "location": "Marioland",
      "society": "TestSociety",
      "start": "14605026110490",
      "end": "14605026110500",
      "details": "Play some Mario Kart with us",
      "organiser": "test1"
    },
    { ... },
    { ... },
    { ... },
    { ... }
  ],
  "error": 0
}
```
The error codes are as follows, `1` indicates an invalid authentication key and
`2` indicates a malformed request.

### /society/join/
To join a society, a `POST` request should be sent with the following data:
```javascript
{
    "society": "TestSociety", // Society name here
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2" // Auth key here
}
```
The response is then formed as follows:
```javascript
{
    "success": 1, // Indicates successfulness
    "error": 0
}
```
The error codes are as follows, `1` indicates that the user is already a member
of that society and `2` indicates a malformed request.

### /society/leave/
To leave a society, a `POST` request should be sent with the following data:
```javascript
{
    "society": "TestSociety", // Society name here
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2" // Auth key here
}
```
The response is then formed as follows:
```javascript
{
    "success": 1, // Indicates successfulness
    "error": 0
}
```
The error codes are as follows, `1` indicates that the user isn't a member
of that society and `2` indicates a malformed request.

### /events/create/
To create a new event, a `POST` request should be sent with the following data:
```javascript
{
    "society": "TestSociety",
    "name": "Test Event",
    "location": "Test Location",
    "start": "1460552065702",
    "end": "1460552065734",
    "details": "Some details about the test event",
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
Note that the end time of the event must be greater than the start time and the
start time must be greater than Date.now(). Perhaps some client side
verification that ensures, for example, the time of the event is the next day.
The response will look like this:
```javascript
{
    "success": 1,
    "event": {
        "id": "101898721",
        "name": "Super Mario Kart Party",
        "organiser": "test1",
        "location": "Marioland",
        "society": "TestSociety",
        "start": "14605026110490",
        "end": "14605026110500",
        "details": "Play some Mario Kart with us"
    },
    "error": 0
}
```
The error codes are as follows, `1` indicates that the user is not an admin of the society,
`2` indicates that the event times are in some way invalid and `3` indicates that the
request was malformed.

### /events/view/:eventid
To view any individual event, a `GET` request should be sent with the following data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "event": {
        "name": "Super Mario Kart Party",
        "location": "Marioland",
        "society": "TestSociety",
        "start": "14605026110490",
        "end": "14605026110500",
        "details": "Play some Mario Kart with us",
        "organiser": "test1",
        "id": "101898721"
    },
    "error": 0
}
```
The error codes are as follows, `1` indicates that the event does not exist, and
`2` indicates a malformed request.

### /events/pending/
To get a users pending events, a `GET` request should be sent with the following
data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "pending_events": [
        {
            "name": "Super Mario Kart Party 5",
            "location": "Marioland",
            "society": "testsociety",
            "start": "14605026110490",
            "end": "14605026110500",
            "details": "Play some Mario Kart with us",
            "organiser": "test1",
            "id": "851133039"
        },
        {
            "name": "Super Mario Kart Party 6",
            "location": "Marioland",
            "society": "testsociety",
            "start": "14605026110490",
            "end": "14605026110500",
            "details": "Play some Mario Kart with us",
            "organiser": "test1",
            "id": "838450388"
        },
        { ... }
    ],
    "error": 0
}
```
The error codes are as follows, `1` indicates an invalid auth code and `2`
indicates a malformed request.

### /events/accept/:eventid
To accept an event, a `POST` request should be sent with the following data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "success": 1,
    "error": 0
}
```
The error codes are as follows, `1` indicates an invalid auth code, `2`
indicates the event could not be found and `3` indicates a malformed request.

### /events/decline/:eventid
To decline an event, a `POST` request should be sent with the following data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "success": 1,
    "error": 0
}
```
The error codes are as follows, `1` indicates an invalid auth code, `2`
indicates the event could not be found and `3` indicates a malformed request.
