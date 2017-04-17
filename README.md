# Second web API

## TODO

- Render styles in the order that they appear in the (root-first) dependency tree
- Better support for Morph requester formats
- Cache expensive operations between requests
- Formalise some specs that can be converted into ✨ tests ✨

## JSON envelope format

This API works with the envelope format, which is a JSON object containing the following properties:

- `head`: an array of strings intended to be inserted into the document <head> element. Usually stylesheets, metadata, and blocking scripts.
- `bodyInline`: a string intended to be inserted somewhere in the document <body>.
- `bodyLast`: an array of strings intended to be inserted at the end of the document <body>. Usually non-blocking scripts.

## Usage

> **Note:** Any components must be installed (with [npm-install](https://docs.npmjs.com/cli/install)) before they can be rendered.

### `/render/:module -> Envelope`

Renders `module` with second-renderer, and bundles its assets with second-bundler. Returns a JSON envelope.

### `/preview/:module -> HTML`

Renders `module` with second-renderer, and bundles its assets with second-bundler. Inserts the results into a standard HTML page.

## Running the server

Clone, install, and link everything up

```
git clone git@github.com:wildlyinaccurate/second.git
cd ./second/second-bundler
npm install
cd ../second-renderer
npm install
npm link ../second-bundler
cd ../
npm install
npm link ./second-renderer
```

Then link or install the modules you want to render, e.g.

```
npm link /path/to/morph-modules/news-top-stories
npm install some-great-module
```

Now build and start the server with

```
npm run serve
```
