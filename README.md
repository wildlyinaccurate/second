# Second

Second is a framework for building and rendering React components on the server.

> In traditional rock climbing, the second is the climber that ascends after the lead climber has placed protection on the route and created an anchor at the top. Seconding is typically much easier and safer than leading.

Second is composed of several main components:

- [second-renderer](packages/second-renderer) -

## Contributing

### Setup

```
git clone git@github.com:wildlyinaccurate/second.git
npm install
npm run lerna bootstrap
```

### Running the example application

Run the [example API server](packages/example-simple-api) with

```
npm start
```

Second understands the `NODE_ENV` and [`DEBUG`](https://www.npmjs.com/package/debug) environment variables:

```
NODE_ENV=production DEBUG=second:* npm start
```

### Running the tests

Run the tests during development with:

```
npm run lerna run test
```

Or if you have [Lerna](https://github.com/lerna/lerna) installed globally:

```
lerna run test
```
