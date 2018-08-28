const { Buffer } = require('safe-buffer')
const fs = require('fs')
const inflate = require('inflate-raw')
const {
  PreHeader,
  CompressedHeader,
  Messages,
  PlayerData,
  GlobalVictory,
  Diplomacy,
  TechTree,
  MapData
} = require('./struct')

class SCX {
  constructor (path) {
    if (typeof path === 'string') {
      this.path = path
    } else if (Buffer.isBuffer(path)) {
      this.buffer = path
    }
  }

  open (cb) {
    fs.readFile(this.path, (e, buffer) => {
      if (e) return cb(e)
      this.buffer = buffer
      cb(null)
    })
  }

  parse (cb) {
    if (!this.buffer) {
      return this.open((err) => {
        if (err) cb(err)
        else this.parse(cb)
      })
    }

    const pre = PreHeader(this.buffer)
    inflate(this.buffer.slice(pre.headerLength), (err, uncompressed) => {
      if (err) return cb(err)
      const opts = { buf: uncompressed, offset: 0 }
      const header = CompressedHeader(opts)
      SCX.version = header.version
      const messages = Messages(opts)
      const playerData = PlayerData(opts)
      const victory = GlobalVictory(opts)
      const diplomacy = Diplomacy(opts)
      const techTree = TechTree(opts)
      const map = MapData(opts)
      cb(null, {
        pre,
        header,
        messages,
        playerData,
        victory,
        diplomacy,
        techTree,
        map
      })
    })
  }
}

module.exports = (nameOrBuffer) => new SCX(nameOrBuffer)
