# genie-scx

Genie Engine SCX (scenario) file reader for Node.js and the browser

[![NPM](https://nodei.co/npm/genie-scx.png?compact=true)](https://npmjs.com/package/genie-scx) [![Greenkeeper badge](https://badges.greenkeeper.io/genie-js/genie-scx.svg)](https://greenkeeper.io/)

## Usage Example

```javascript
var genieScx = require('genie-scx')
genieScx.load(fs.readFileSync('/path/to/scenario.scx'), (err, data) => {
})
```

## API

### `genieScx.load(buffer: Buffer, cb)`

Parse an SCX file. `cb` is a Node-style callback `(err, data)`. `data` is an object with lots of data. Use console.log or devtools to figure out the shape.

## License

[MIT](./LICENSE)
