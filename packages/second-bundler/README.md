# Second Bundler

Bundle the assets for Second-compatible component modules

## Installation

```
npm install --save second-bundler
```

## API

### `getStyles(moduleName) -> Promise(Bundle)`

Builds a bundle containing the core & enhanced styles for the given module and all of its dependencies. `Bundle` is an object with `core` and `enhanced` properties, each containing an array of CSS strings. For example:

```js
{
  core: [
    'body { color: red; }',
    'button { border: 1px solid blue; padding: 1rem; }'
  ],
  enhanced: [
    'button { animation: blinker 1s linear infinite; }'
  ]
}
```

#### Arguments

- `moduleName` _(String)_: A name which, when resolved by `require()`, returns a Second component.
