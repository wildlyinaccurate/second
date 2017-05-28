# Second Fetcher

## API

### `new Fetcher({ ?handlers, ?request }) -> Fetcher`

Constructs a new fetcher.

#### Arguments

- `handlers` _(Array<Function>)_: An array of handler functions. When given a request where `uri` is not a `string`, fetcher will iterate over the handlers, calling them in turn until one returns a `string`.
- `request` _(Function)_: A function that takes a single parameter, `url`, and returns a `Promise` that resolves to an object with `body` and `statusCode` properties.

### `request(requests) -> Object`

Makes a request for each `RequestObject` in `requests`. Returns an object of type `{ [string]: Promise }`, where the keys When there are no more outstanding requests, the return value

#### Arguments

- `requests` _({ [string]: RequestObject })_: An object where each key is a request identifier, and the values are `RequestObject`s.
