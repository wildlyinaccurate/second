# Second Dehydrator

Dehydrate React/Preact components on the server so that they can be rehydrated with their original props on the client.

## Installation

```
npm install --save second-dehydrator
```

## Usage

Dehydrate components before rendering them on the server:

```js
// server.js
import React from 'react'
import { createDehydrator } from 'second-dehydrator'
import MyComponent from './my-component'

const dehydrate = createDehydrator(React.createElement)
const MyDehydratedComponent = dehydrate(MyComponent)

// <MyDehydratedComponent prop1="foo" prop2="bar" /> will render MyComponent
// and a <script> tag containing the dehydrated state and props.
```

Avoid bundling the dehydrator by defining the `DISABLE_DEHYDRATOR` value. For example, [with webpack's `DefinePlugin`](https://github.com/wildlyinaccurate/second/blob/5637da3251b38788567a8b371e3c75383792ee87/packages/example-simple-api/webpack.config.js#L27).

Then rehydrate them in the browser:

```js
// browser.js
import React from 'react'
import ReactDOM from 'react-dom'
import { hydrate } from 'second-dehydrator'

// Create a function to render the component
const renderComponent = (Component, props, container) => {
  ReactDOM.render(
    React.createElement(Component, props),
    container
  )
}

// Create a map of components. The key names must correspond to the components'
// displayName or name property.
const componentMap = {
  MyComponent: () => import(/* webpackMode: "eager" */ './my-component')
}

hydrate(renderComponent, componentMap)
```

## API
