# uni-society-manager [![travisbadge](https://travis-ci.org/Alpha-Atom/uni-society-manager.svg)](https://travis-ci.org/Alpha-Atom/uni-society-manager/builds) ![dankmeme](https://img.shields.io/badge/contains-dank%20memes-brightgreen.svg)

Server for Integrated Project, powered by Express.js and Redis, listens for HTTPS requests on port 443 and HTTP requests on port 80 and port 3000. Certificate provided for free by the brilliant __[Lets Encrypt!](https://letsencrypt.org/)__ project. Unit tests are run on each commit with __[Travis CI](https://travis-ci.org/)__. Results of these tests can be viewed by clicking the build passing/failing badge. Unit tests exist for each route with a :white_check_mark: by its name.

![HTTPS Screenshot](http://i.imgur.com/HUOTv2o.png "HTTPS Hello World")

* [uni-society-manager](#uni-society-manager)
    * [Installation](#installation)
    * [Running](#running)
    * [Testing](#testing)
* [API](#api)
    * __Misc__
        * [/hello/:name/](#helloname) :white_check_mark:
    * __User__
        * [/user/register/](#userregister) :white_check_mark:
        * [/user/auth/](#userauth) :white_check_mark:
        * [/user/view/](#userview) :white_check_mark:
        * [/user/view/:user](#userviewuser) :white_check_mark:
    * __Society__
        * [/society/create/](#societycreate) :white_check_mark:
        * [/society/view/](#societyview) :white_check_mark:
        * [/society/view/:society\_name](#societyviewsociety_name) :white_check_mark:
        * [/society/view/:society\_name/events](#societyviewsociety_nameevents)
        * [/society/join/](#societyjoin)
        * [/society/leave/](#societyleave)
        * [/society/promote/](#societypromote)
        * [/society/kick/](#societykick)
    * __Events__
        * [/events/create/](#eventscreate)
        * [/events/view/:eventid](#eventsvieweventid)
        * [/events/pending/](#eventspending)
        * [/events/accepted/](#eventsaccepted)
        * [/events/declined/](#eventsdeclined)
        * [/events/accept/:eventid](#eventsaccepteventid)
        * [/events/decline/:eventid](#eventsdeclineeventid)
        * [/events/cancel/:eventid](#eventscanceleventid)
    * __Friends__
        * [/friends/add/](#friendsadd)
        * [/friends/remove/](#friendsremove)

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

A production environment, using HTTPS can be started using:
```
node index.js -p
```
Do note that this requires both cert.pem and key.pem to be in the root directory
of the project for SSL or it will not start.

### Testing
To test, start a __new__ Redis server somewhere other than the main database
with:
```
redis-server
```

Then start up the Express framework using:
```
node index.js
```
You do not need to use the production environment for this.

Finally run the tests with:
```
npm test
```
__DO NOT__ run `npm test` whilst the main database is running on `localhost:6379/0`. The testing command
flushes that database at the end of the tests and this will occur regardless of
test passes or failures.

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
    "auth": "$2a$10$.X9YrNyd2R7b2ycAumHn.ONiINs2bCkRDupugu6sjZkUkPmXSaSra",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QA2RXhpZgAASUkqAAgAAAABADIBAgAUAAAAGgAAAAAAAAAyMDEwOjAyOjE4IDIyOjA0OjU1AP/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/CABEIAOwA7AMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQQCAwUGB//EABkBAQADAQEAAAAAAAAAAAAAAAABAgMEBf/aAAwDAQACEAMQAAAB+mSAAAAAAAAAAAAAEJAAAAAkhIiQRIhIhMAAAAAACQAAAAAAAARIRIhMAACQAAAAAAAAAAAROEMmvYBKQAAAADRSd+HMr8O/W18unza9vRSwyt2rvktXRT2bi9n0eaUc+9bHN00OLf0HQ07u3CBeJAAAAxrc/h2tUFfyOvZpp9LDSh0a3OLVLTeXrXo58x0M+Llo9BHP0dfPdscb3vZjvI9DmEGQAHM6fI4Ns5oVeDe3Pn5xnp6MrXPvhWp6YujobJRzYqSynLZo2RRSuZ4ek2yt9dHu+bMRFolA2CQQVbWNJ5vnvS+Y83po17VfJa3c3rcu+NzPmc+u/lxrvbXeitZlpizeGytWlb9T5j13Vh1opbfY4LM6tkxnMZGYAJMTzvJ3afE79WW30968/VnyeO+nmb8MujLdp0WjZVmzoU7WyWrZqxrHX9B531XrcM7429mE5srQmJMgAT87+g+M5drXJ5/N4t7W6nsy06+W/Xwa40rmtejus0tIzlT2pZ00Y6s9Wu12dc73puZ1Ovntbde7bPKYymBJICETzeB2vN+X1UKfo+st5ifU8yJ5mzGr5vRa0NNJ3Rr5m1dnO2W/SxqXOl09Kc/s2ru+Wu43a5M2VoSmYAmAiJxicdW3Cs4V9tel6dC7S59ddTtUcLecpdGpW9ez2On0V4/U6dvXKjdsbtc9W7PO9cc2U1iUyAARMEYzjExqnTE4189Wd6le/OdqdXsZnCv9LZeKVmzneurbnlauOUzMJTKJEJiQACYmDHHZBpws4xNSLaJqzZgrzugwyymYiZkiQkmYAATAkASAIQAgCJGMZQkmBIJiUASAACUCUJf/xAArEAACAgIBAwIFBAMAAAAAAAABAgADERIEEyEwBSIQFCMyQBUgMUEzYHD/2gAIAQEAAQUC/wC1sQIjh/wSwENonXEPI7/Nynkq8BB/a1gltk4f+PzWWBI9rNM97G1BZ7F6eQxWG8CfMkGjlMYDkEgSy3Md8Qsc1LpX5GYLHtLDYgFtQ9gZUSx5uI92htfIqpaw9KpY1sTklZ8xvN8x7FUen19SzyPdg77H+I76TuzphVazU3WTS1x0KlVrch7czD2To25GEjOTETd6axVX4bLzmq/332ZIOD/dlmraFzjorZZmPbkV02mWNopsm/uVWebBIXm2Y4JbgcXor4mXEKSy1ao91rV08g4TSx3fQPb3qSy2VUqkazWM/epevErRUJjWTS15Wornpaq3ktHcicn79dg/8cQgy5iJTRCRXLnzLbPpKrcgMQqucTBsi4Wf0z9/Shqm0zM+FhkNLxlrcmMvtr+41tZHOqF4XgpeZAlpwq4uCjEa5VG7vKElXsTMEHivvxFGTee1HFe2V8auqWnEtsm5d0rXbaMQkGXJIQsjWEV4HsScQFnUQCAQeFiFU5dycTh6veTgWclJdeYAxYjDntOqOouzWdqxjtvO03XfiN9QQeOrlcnk8zIVbLMxrCli3WWWdM74w9ixzvGq76S1umVWFgITmXsSaVtJ4NWkQwQeFzqvU9/qdrdOqwbmU93bYG7Ja3eNWENxCqS1grTtbfmbzMVMmiqUrEEHi5L5luoj4aaZn6fYq6IInsL/AH3vLSzDprhdQt9x+ASJVKqZVViIsA8dy6hq2Jp9PcmrjVUmx5ZgxxidQ4PIRoWEssRQ1xwBmJXK6ZXTErirAIPGwBAVVhjR401yLq4y4hPfuxSomV0SumJVFSBYBMeYxo8aL2FhnJsxKuOzSrjARKYtUVIFgEx5zCY0b4d8NSWlfERStUWuBIFmPwTDDCJpNJpAkCQLNZj8PExNZrNZrMTEx+RiY+GP9R//xAAlEQACAgEDAwQDAAAAAAAAAAAAAQIRAyAhMRASUQQTMEEyQGD/2gAIAQMBAT8B/gUm+COB/ZHAj2oD9NfBPG4cijZGND51Qwt8kYJbIqj8ikjdjimShXBkdLThq9ztjfce6hPwV9svxozOo2N3pi6ZDcpswvbc5F13PUOo1rSolPt2RivnTZmlb1Yo27Lp0ci6ydDmyTJasdUPIiGTyKSfRyobHIchvWiIpHcOY5jZfwIss7i/jsv9r//EACgRAAICAgEDAwMFAAAAAAAAAAECABEDIRIEIDETMlEiMEEFQEJQUv/aAAgBAgEBPwH+6Bvvd1QW0ydeB7Y/XvD1mU/mY/1EjTbmLOmUWsdwsfIWiCh3ZutVNLszJmbJ9TGBi2pdeJXzL+Itru5jylvMwJzN9vXHIFHpmetm4cDBg1uFT+ZV+JYXxFS9mWP4zh/qdOvJ+IiqFFDtyLyFTOKh1M1Dc5RV3bT3aE8eJw/JnRpeS/iX3MxY2YmLn9RnVgNoRQBKLTxoS6mzOlXivd1OXivH5gx2nKNpYbuLqAlhuIhbSxcCr5iqIgruz8i24mBjM3T37THwsp3ACJjxM8VQooQLcVIB3VDGjrcRIMcXHAsr7BhWenAkAlfaqVK/c//EACoQAAIBAgUDAwUBAQAAAAAAAAABEQIhEBIiMVEwQWEDMkATIHGRoXCB/9oACAEBAAY/Av8Aa7jj4N2cmxsdjhlvttg3y+vyW2LkiapJdTZssLM1025JRc8EU7kdymnq3Y8ti6JV0WL7EYaSareGTBYsyWzgil3Mz2XVikcng5RpIwsXpsKpSWGTQLYggVNN2KldJqmyEm5TMtOxsXUETY8Ci5KwT9RRSQnNJBVczQshossORZe5mq97/nVuhVN5U+ODNMUecIexA1TsNeolm5Mr2PA4qiB01JOrksaVmv2NTyrwW3KqmtS6zkc7CfGw88kPYzeopRNG2Db7CdPtX9FlUCbZ3pS/pNKgZlp/ZX1/AkQK1hIaIbPqTK4JpsNmpfgWbsadTI2XguR1XSvcXIWxOy5ZtNXLwmpmgf1Lsy8FWYpr/h5fY1fnDlkv89Vt9htjt+jX/wAWETLLIn1CUKSKFI3XuNd+yM1fuLLH89X1afUbpopd6e34w0k0MSq9RuRXL4Kml6hOptkoVpZnfuY+7Lv9GktBNTl9RvgdTV2abT3H9PNljd92SIpFTtJBNJIo0oebcinb4ORbdyENMsT6qtwiEsKWyTguyw6V8JyWM1byrgmJq5eMmvbCM2EK3w7mlfft8xYQt/m+4mL8/wCUf//EACcQAQACAgICAgICAgMAAAAAAAEAESExQVEQYTBxIIFAkaGxUHDh/9oACAEBAAE/If8AusWPQH8HHhcPq4zVt9ymgD7lrThLMcH9QDIfr8TYzZTu7YfnIN26Ipb+pKl7i8sVAkQEDzAAgIYHMepmDHcbOp9QQugAJY8w21RNEg4HcJ9CHygWRBbF3MBIrA6IgpDBQe/MqL8SxRxFfk6j5K8hllzkOFlbSm+CmK5uLNGHLM4ErT8r9/KCBfuZJ39xpOMp2rIuEW91MQKqHdxzEbd+JkXHtuWMscXDFwSLdeSWkRDlazCivPedQMULrYy/vVP9xhduCcb+3t+K9FDVhliGlnPDHtfZGJQq2IRFoWjALXdmwUN+5Xsrpn3XU+/ju2ftwRBeDklQEBL6y3JeWBaFvHUa1vIXM3b14CRLUfGvJ0y5gmdea6lqMW9IUsRiuUzd46J3g0zmMcRghV2wuzYfM9Ga3KPbVvXuCALfvLUcLwwM2f4EuNK59oNV3ksWsNb1Lly/h3u/DnxI5nlscSp+gEaStezEscr5mP1EZiUOpCN3uHY1yjk8jFWVCmoKqDJMgtS6ghT4NRH99Esa1wzdkpUPwQ/DOszN3mZKH/uYk5DcCZKCcSdmN0EoeHZAL0JiM23Li9HYS29Jg7YtDrTqZRVyWMgUZ9TF34e64YlSG3LBsT4EPgvQPRJTighwiQHYJG1eY16B3MWijlh6d+bJYKONIKtKsO5cLgKOhF96rIW2UcPUMb3UunhzRBja0/BwQPgdOgXOL1sQjOuYBsEC+xg+iFaeoRl/puAUvqEIVeGOyVZjxBN8QCJ1DVTEqZKmyorq+48FtW4jTddTGzlQwQh8KsrUOGcUjk6MQyw2VjI9T3qoxLMhWVf3Gp9SzmH+I2JPcKIFcQf0zOFtIpST/wCnGaUmtntio/1M/Aj4PS5Z2c2vbD0wIHodxhWGr/YBwStI1MmdzA6YyxZZZmAm6WoTDUUv9E+rjUqbMWKzcft4LYuYlVYlIeAw+HffZLzRfcVI1MgHeg5mGp2LZStk2nPqLAUDawAwtuYSUeY5NmIw2v1Fa5dLKWMx2enwKfEED4eNM3cqeTeKimycssMGn+rxAswcA2cjNoXOAcfZH0SnU2PPUUhy2xYd4mjE9Eq48uIHxUICTWp7iijjhscykozzcbCBLkXsTeT0SniAcSjzBFfGx8VHBmC08ELN7h8tzJohKTEM4hHEp8yQHxvhi8T8Ubiqk3aD0SgLrllg9T0wjwEBKlfGxjFHLRGWYSfhBIJCBK+dIwy/k2RUqV/CqVK8leFSof8APH8D/9oADAMBAAIAAwAAABCQzzzzzzzzzzxyjDzzzzjCBDDTzzzwzyAAAAAAAABBDTzyAAAAAAQwwAABbfwAAAAR7yCI2QGovwAATyl6cdVdhngTQQSp22LTOMwQHI77z6kHjysP2aRJhXr75GdmBW05xuX9Er/+QHvN4O0qdZBlrs4VjyNev5fCp7l5nbEpviZyqtKvl771oCrs7zCJ4j+vL4bWboK+1K5lP+4bzA6u1HwTSvcNPI6z/8QAIBEBAQEAAgEFAQEAAAAAAAAAAQARITEgEDBBUWFxUP/aAAgBAwEBPxD/AGQ3qROHzVwSu8s1guM273GSys4Y9T5cjwInCSde5Fc9Rh2X8ITGJ/SHI7fENJ2HytFCED5R/ZGOIGEuRzA30nevjyF3LZVzJOE172AwlZc7gUeH5kyzwCMYXUoJ1d2S533fpIO7k5fH+cuLmAXJcr6t2Go6kDmWs+BYcGL1zP8AC5GEj4Mi6wltaeQvUfQo8X3itrWfMXCCXGY1bfYH1Nt9N959j//EACcRAAMAAgIBAwIHAAAAAAAAAAABESExIEFREHGRMOFAUGGBobHR/9oACAECAQE/EPzltJViEq5sDojDL+70IvHxDJOCCn3IskS52YRkNcn/APkD7YWP0+BhGEJX8tMUZazIrwgzohinOsdVpcV1C7I7977ngfsGm28SK8CIGvuIegaHgLsxPbELRUvrXCISG0F8QaPCyLbe8Nt0jAlrsKgxHQXE3FWWJTcMEjrMXt/wdvQp5HkXWJMuxcUJccU2GuVqL5MiODQTJye+hUbRDGXuzLZMawlgkiFxyifYyTUQxv7DyYTKsiWrVJpGhCIC4MaWzPp3E7bI4lHCEIQuRjEpUh7QhERR9GeiPRPxH//EACkQAQACAgEEAgEEAgMAAAAAAAEAESExQRBRYXEggZEwQKGx0fBQweH/2gAIAQEAAT8QlSsfuX/gH9OvhUqVH/gH9WunP7Guj+9Oj+/r9lUqVKlSvnalXY5Zum3SMf1q6JUHZzEwLeCg+44f0MXrTi24iw+iJr5/P5S5C91cergtwRRc7n+IhVa1OYy8M1d6Mfq89L+37WvcHe46ftmHsVZiMSOzNjM4LBmDzMzSkED8TJC7hcpyohT7gR9jSqt4j2x8Ck81zCxCsGmIzeSJek4nf3LBLXNYCEBtHLd7ZjAExrvz+kdUpEzlj0iY7oXYu6Uz9xxuhvf2QNCkvHbzCLlovkHiFN0jHrxLlM6a7S1C5AbXtNFGECAQG8vQ8zGADAeuIIYwqnFPiALKP4fEO7TZWZnoTZmE7FbvPA/76P6dwCbWvrvLXAGnlFkpmsvEu6cp2R0HLAa8yuuRp2+WIxh6Bj3LUXuDvEni0MEWFUOVF8kUTXZZtN/1AjTrCNKxKirV04jGPUVZKg6l8xPkRoryjTExyRB8nI9bl/A6XBbIEN12I1ZHl4PqU3IxmLjIXCO7mCYOn/2MHaBeIL2YyTR6la3mWKfKVgFsICW7U+UcsbNRR64iURzFMnuOFwf5JSuK281Hd1xUfUY6jeK8doUSB2+osSm0x3VmHeYhoLb0hADs+E0ePcuLLly/ljDKHuZDSckUqS0cRzbBxUQKe1/WfceSVReThphUiMtzC/7xHwTiEx68Rh3XvJ14jE2A1BfETNVSl16gWYiu/wCPcYVvbww/A86Fy3KybKM+UpCHANXLQTbJlQ5YnMHnbwbmaKQZaL5gRnlmSxmjvjcRERhbly4dOetoJj+0otqEOjlngIxaQtOXYfqWmPcsD3/98QNopFor/pM8dFZvx7hJ51wDuwPmB0JEQtsJFYetvJqAkGp0xwT8qvvcBcyivFXG1tI5l/6j9chS3x+Y0hWh+SJdTCDAnB/mMJsBe6uJlXmZdAhr5WByZIwwcQyyOIwviFhnB3MFEuV3LuUhd25w/wCsooipcI+u8t0FEw7jWWtHbuQU4HjPEfkHvKr/ADL8Qe09zJVshuyqICsDrlXf3AAIsIoxFKKvWLe/EX3HC2Xm2WunRXPEPcCXv2+umMl4X5jphXk/R3lGsQ5zlYdDkEOWMTXNCWeDbO/aCtvwaItzbiHEMlGItzDASU92Hp4Bv6jch/IIuXH9p4D3FrEjrve5ZkSg2vf1Asw8P0gWS9c+X/EqkPuDjcqRcQot/uI7lcM6oFMr5CUUSwWghh8rHaqbchExXOa7nmpblAcuplcNDf8AOoAmvQW2GKaeh4qEx4w/ErjtTLUZePNpb3DTBjQcKitifJVnJ2jkGhgO3Y4Ikw3oXiVwTIrzxeLlcUyAaR16UDHbtB6RhqEPkbIKWikyBqbAteWLFmK7dcxLQjhr+4RUUM5XifglI+tR7EsabzLWg4VXUEGnSHQiWp2Spl4uw8hBJaJgbGK92EyoDi5UimGuPbAB2KrePzALqvL/AEWzSFKw7gANjoiF+PFegiIRWdQh8qGBaV5ouBpCsxVnLHapqF3b9tR1Ai9F2exsUqtW7hKlvcVkBAi6IqM92msQlwJZk5xGhqzuquViB3bt7wo7E8ivEti7LMr3WZ5sQ3b3lu5UpGL9eILQ0Qui/qGrJbRC4EoDHSMCB8blxr+IufEysI5UML8HvTBZBoCtTgIkWDaX0NamRetUmvbFaGeKN16grMVHEqzAIEsIbFra8SppMrW2GQK2hv14j9a0F33CcCNkbLI9kGDH8QwYldSvoB0Ot9Ll4ZVDvjQ08GyPiBmLqse9cfcVM2zYvBoiIkdURezLLb5QSZSieMMYGpW6AmdqYHaWFDXA2wseaht+u0e0yltS3KDKuBrFXEo46oHQ6vRixA9cJAGz5Bl9u5WTHN0ys0ehYfUFho6D+ICqytq4qJ1yaSZdaY4IY7VxhRUQdKIJWIZxKoUgdD4rFixR7im6BmXQJQKqaslxGsl7MyU6YZo7xE8l7YDse8oIqIDhBDBKZRKYED5sYosc29C0iW6mVqZL/iXIw938xRyMtkFWB9QCoqMQjiGcTxwkgJdQ6Hxeo2MRI1LCOwTLkg4xB7QB1A7QjiAdcICB0rv8OPgxiSyXsv4nhge0B2h4wkpA7Qz1DOAgVKgSuh+jfSuitxl8JTtKzwj0hRmY7Qq4Q6nQ+O/lcucxjGVEiXAYFkqBmV8L+F/N+D0ejGMvo/Aw1+p//9k="
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
        "users": ["FooBar", "BarFoo", "FarBoo"], // At this point the users will simply be the admin list
        "image": "data:image/jpeg;base64,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"
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

### /society/promote/
To promote a user within a society, a `POST` request should be sent with the
following data:
```javascript
{
    "user": "Test1",
    "society": "TestSociety",
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then be formed as follows:
```javascript
{
    "success": 1,
    "error": 0
}
```
The error codes are as follows, `1` indicates that the auth key is invalid, `2`
indicates that the user does not belong to the society, `3` indicates that the
user is already an admin and `4` indicates a malformed request.

### /society/kick/
To kick a user from a society, a `POST` request should be sent with the
following data:
```javascript
{
    "user": "Test3",
    "society": "TestSociety",
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then be formed as follows:
```javascript
{
    "success": 1,
    "error": 0
}
```
The error codes are as follows, `1` indicates that the auth key is invalid, `2`
indicates that the user does not belong to the society, `3` indicates that the
user is an admin therefore cannot be kicked and `4` indicates a malformed request.

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
        "attendees": [],
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
        "attendees": [
            "test1",
            "test2"
        ],
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
            "attendees": [
                "test1",
                "test2"
            ],
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
            "attendees": [
                "test1",
                "test2"
            ],
            "id": "838450388"
        },
        { ... }
    ],
    "error": 0
}
```
The error codes are as follows, `1` indicates an invalid auth code and `2`
indicates a malformed request.

### /events/accepted/
To get a users accepted events, a `GET` request should be sent with the following
data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "accepted_events": [
        {
            "name": "Super Mario Kart Party 5",
            "location": "Marioland",
            "society": "testsociety",
            "start": "14605026110490",
            "end": "14605026110500",
            "details": "Play some Mario Kart with us",
            "organiser": "test1",
            "attendees": [
                "test1",
                "test2"
            ],
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
            "attendees": [
                "test1",
                "test2"
            ],
            "id": "838450388"
        },
        { ... }
    ],
    "error": 0
}
```
The error codes are as follows, `1` indicates an invalid auth code and `2`
indicates a malformed request.

### /events/declined/
To get a users declined events, a `GET` request should be sent with the following
data:
```javascript
{
    "auth": "$2a$10$qjkvbcPZ4YC7/a/I0ZpTaeJp6auXjGrG9pgAdI3PP61u4CftQPSL2"
}
```
The response will then look like this:
```javascript
{
    "declined_events": [
        {
            "name": "Super Mario Kart Party 5",
            "location": "Marioland",
            "society": "testsociety",
            "start": "14605026110490",
            "end": "14605026110500",
            "details": "Play some Mario Kart with us",
            "organiser": "test1",
            "attendees": [
                "test1",
                "test2"
            ],
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
            "attendees": [
                "test1",
                "test2"
            ],
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

### /events/cancel/:eventid
To cancel an event, a `POST` request should be sent with the following data:
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

### /friends/add/
To add a new friend, a `POST` request should be sent with the following data:
```javascript
{
    "friend": "MyFriend",
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
indicates that the user is already a friend, `3` indicates that the user you are
trying to add does not exist and `4` indicates a malformed request.

### /friends/remove/
To remove a friend from the friends list, a `POST` request should be sent with
the following data:
```javascript
{
    "friend": "MyFriend",
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
indicates that the user you are trying to remove is not an existing friend
and `3` indicates a malformed request.
