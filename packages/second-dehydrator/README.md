# Second Dehydrator

Dehydrate React/Preact components on the server so that they can be rehydrated with their original props on the client.

## Installation

```
npm install --save second-dehydrator
```

## Usage

Dehydrate components before rendering them on the server:

```js
import { createElement } from 'react'
import createDehydrator from 'second-dehydrator'
import MyComponent from './my-component'

const dehydrate = createDehydrator(createElement)
const MyDehydratedComponent = dehydrate(MyComponent)

// <MyDehydratedComponent prop1="foo" prop2="bar" /> will render MyComponent
// and a <script> tag containing the dehydrated state and props.
```

Avoid bundling the dehydrator by defining the `DISABLE_DEHYDRATOR` value. For example, [with webpack's `DefinePlugin`](https://github.com/wildlyinaccurate/second/blob/5637da3251b38788567a8b371e3c75383792ee87/packages/example-simple-api/webpack.config.js#L27).

## API
