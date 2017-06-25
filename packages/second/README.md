# Second

This is a convenience wrapper interface around the following Second components:

- [second-container](../packages/second-container)
- [second-dehydrator](../packages/second-dehydrator)
- [second-fetcher](../packages/second-fetcher)
- [second-renderer](../packages/second-renderer)

## Installation

```
npm install --save second
```

## Usage

```js
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import second from 'second'
import MyComponent from './my-component'

second.init({
  VDom: React,
  VDomServer: ReactDOMServer
})

const MyComponentWithData = second.createContainer(MyComponent, {
  data: props => ({
    events: { // Will be available as this.props.events in MyComponent
      uri: `https://api.github.com/users/${props.user}/events/public`
    }
  })
})

second.render(MyComponentWithData, { user: 'wildlyinaccurate' }).then(output => {
  // Do something with rendered component output
})
```

Or with [Preact](https://preactjs.com/)

```js
import Preact from 'preact'
import renderToString from 'preact-render-to-string'
import second from 'second'

second.init({
  VDom: Preact,
  VDomServer: { renderToString }
})
```
