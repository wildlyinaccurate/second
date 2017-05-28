# Second Renderer

## Installation

```
npm install second-renderer
```

## Quick start

### Render a React component

```js
const Renderer = require('second-renderer')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const MyComponent = require('./my-react-component')

const renderer = new Renderer({
  VDom: React,
  VDomServer: ReactDOMServer
})

const markup = renderer.render(MyComponent)
const staticMarkup = renderer.renderStatic(MyComponent)
```

### Combine with second-fetcher to create a container component

```js
const Renderer = require('second-renderer')
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const MyComponent = require('./my-react-component')

const renderer = new Renderer({
  VDom: React,
  VDomServer: ReactDOMServer
})

```

## API

### `new Renderer({ VDom, VDomServer, ?componentIsReady }) -> Renderer`

Constructs a new renderer.

#### Options

- `VDom` _(Object)_: A virtual DOM library that implements the `createElement` function. Examples are [React](https://facebook.github.io/react/) and [Preact](https://preactjs.com/).
- `VDomServer` _(Object)_: A virtual DOM library that implements the `renderToString` and (optionally) `renderToStaticMarkup` functions.
- `componentIsReady` _(Function -> Boolean)_: Optional. A function that determines whether rendered components are ready. When this function returns `false`, the renderer will continue to re-render the component after a short delay until the function returns `true`. This is often used in conjunction with second-fetcher to ensure all data has been fetched for the component before returning the rendered markup.

### `render(Component, props) -> Promise<string>`

Renders a component to HTML, returning a Promise that resolves to a string containing the rendered HTML.

#### Arguments

- `Component` _(Object)_: A component object that can be rendered by the VDOM library's `renderToString` function.
- `props` _(Object)_: Props that are passed directly to the component.

### `renderStatic(Component, props) -> Promise<string>`

Same as above but uses the VDOM library's `renderToStaticMarkup` function.
