# Second Renderer

Second is a component rendering service.

> In traditional rock climbing, the second is the climber that ascends after the lead climber has placed protection on the route and created an anchor at the top. Seconding is typically much easier and safer than leading.

## API

### `render(moduleName, props) -> Promise(String)`

Renders a component to HTML, returning a Promise that resolves to a string containing the rendered HTML.

#### Arguments

- `moduleName` _(String)_: A name which, when resolved by `require()`, returns a component.
- `props` _(Object)_: Props that are passed directly to the component. Can also contain some special props that are understood by the renderer itself (see below).

#### Special props

- `@@renderer`: Specifies which library to render the component with. Available options are `react`, `preact`, `preact-compat`.

## Interaction with `Container` components

CBF writing docs but basically compatible with morph-container. The renderer will shim second-container in place of morph-container whenever it is resolved with `require()` (which should be most cases).
