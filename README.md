# Second

**[Read the blog post](https://wildlyinaccurate.com/introducing-second-a-framework-for-mostly-static-react-applications/)**

Second is a framework for building and rendering React components on the server. It provides a higher-order data component that enables UI components to declare their data dependencies. Second ensures that all data dependencies are met before completing a render cycle. Components that require interactivity in the browser can be dehydrated with their original props, and rehydrated in the browser.

> In traditional rock climbing, the second is the climber that ascends after the lead climber has placed protection on the route and created an anchor at the top. Seconding is typically much easier and safer than leading.

Second consists of several components:

- [second-container](packages/second-container) - Higher-order component that enables UI components to declare their data dependencies. Integrates with second-fetcher to ensure components are only rendered once their data requirements have been met.
- [second-fetcher](packages/second-fetcher) - Interprets and fulfils data requirements.
- [second-renderer](packages/second-renderer) - A lightweight wrapper around any VDOM library that implements [`createElement()`](https://facebook.github.io/react/docs/react-api.html#createelement), [`renderToString()`](https://facebook.github.io/react/docs/react-dom-server.html#rendertostring), and optionally [`renderToStaticMarkup()`](https://facebook.github.io/react/docs/react-dom-server.html#rendertostaticmarkup). Can be integrated with second-fetcher to ensure all data requirements are met before completing the render cycle.
- [second-dehydrator](packages/second-dehydrator) - Dehydrates a component's props and state so that it can be selectively rehydrated on the client.
- [second-bundler](packages/second-bundler) - Experimental runtime stylesheet bundler.

## Installation

```
npm install --save second
```

## Getting started

Make sure you first install a VDOM library with a React-compatible API. For example, install React with `npm install --save react react-dom`.

```js
const VDom = require('react')
const VDomServer = require('react-dom/server')
const second = require('second')

second.init({ VDom, VDomServer })

const Component = require('./your-react-component')
const props = {}

second.render(Component, props).then(content =>
  console.log('Output:', content)
)
```

Use the higher-order container component to declare data requirements:

```js
// your-react-component.js
const React = require('react')
const second = require('second')

const WrappedComponent = require('./other-component')

module.exports = second.createContainer(WrappedComponent, {
  data: (props) => ({
    // Each key is provided to the wrapped component as a prop
    repo: {
      // Use props to programmatically fetch data
      uri: `https://api.github.com/repos/${props.repoName}`
    },

    contributors: {
      uri: `https://api.github.com/repos/${props.repoName}/contributors`
    }
  })
})
```

Dehydrate components to prepare them for rehydration on the client:

```jsx
// sub-component.js
const React = require('react')
const second = require('second')

class SubComponent extends React.Component {
  render () {
    // ...
  }
}

module.exports = second.dehydrate(SubComponent)


// main-component.js
const React = require('react')
const SubComponent = require('./sub-component')

module.exports = class MainComponent extends React.Component {
  render () {
    return (
      <div>
        <SubComponent prop1="foo" prop2="bar">
          <span>Children will be dehydrated as well!</span>
        </SubComponent>
      </div>
    )
  }
}
```

### Example application

For a more complete example of a Second application, see [example-simple-api](packages/example-simple-api).

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
