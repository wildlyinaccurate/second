# Second API example

This application uses [Express](http://expressjs.com/) and [Second](https://github.com/wildlyinaccurate/second) to build a server-rendered [Preact](https://preactjs.com/) application.

## Running the example

First, install the example:

```
git clone git@github.com:wildlyinaccurate/second.git
cd second/packages/example-simple-api
npm install
```

Then run the server:

```
npm start
```

Or run the server with logging enabled:

```
DEBUG=second:* npm start
```

Then open [http://localhost:8082/events/wildlyinaccurate](http://localhost:8082/events/wildlyinaccurate) in a web browser. Change `wildlyinaccurate` to any GitHub username.
