# genie-scx

Genie Engine SCX (scenario) file reader for Node.js and the browser

[![NPM](https://nodei.co/npm/genie-scx.png?compact=true)](https://npmjs.com/package/genie-scx) [![Greenkeeper badge](https://badges.greenkeeper.io/goto-bus-stop/genie-scx.svg)](https://greenkeeper.io/)

## Usage Example

```javascript
var scx = require('genie-scx')
```

## API

### `SCX(filename: string)`

> Node only!

Creates a new SCX instance for the .SCX file `filename`.

### `SCX(buffer: Buffer)`

Creates a new SCX instance for the given Buffer.

### `scx.parse(cb)`

Parse the SCX file. `cb` is a Node-style callback `(err, data)`. `data` is an object with lots of data. Use console.log or devtools to figure out the shape.

## License

[MIT](./LICENSE)
