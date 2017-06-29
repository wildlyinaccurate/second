# Second Container

Build data-driven React components with a higher-order container that handles data fetching.

## Installation

```
npm install --save second-container second-fetcher
```

## Usage

```jsx
import { Component, createElement } from 'react'
import containerFactory from 'second-container'
import Fetcher from 'second-fetcher'

const fetcher = new Fetcher()
const createContainer = containerFactory({
    fetcher,
    Component,
    createElement
})

const MyComponent = (props) => <div>{props.username}'s name is {props.user.name}</div>

const MyDataComponent = createContainer(MyComponent, {
  data: props => ({
    user: { // Will be available as the 'user' prop in MyComponent
      uri: `https://api.github.com/users/${props.username}`
    }
  })
})

// <MyDataComponent username="wildlyinaccurate" /> will render as <div>wildlyinaccurate's name is Joseph Wynn</div>
```

## API
