const { Buffer } = require('safe-buffer')
const fs = require('fs')
const inflate = require('inflate-raw')
const {
  version,
  PreHeader,
  CompressedHeader,
  Messages,
  PlayerData,
  GlobalVictory,
  Diplomacy,
  TechTree,
  MapData,
  TribePlayerData,
  MorePlayerData,
  Triggers,
  Scripts
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
    inflate(this.buffer.slice(8 + pre.headerLength), (err, uncompressed) => {
      if (err) return cb(err)
      const opts = { buf: uncompressed, offset: 0 }
      const header = CompressedHeader(opts)
      // let structs know about the current version.
      version(header.version)
      const messages = Messages(opts)
      const playerData = PlayerData(opts)
      const victory = GlobalVictory(opts)
      const diplomacy = Diplomacy(opts)
      const techTree = TechTree(opts)
      const map = MapData(opts)
      const tribePlayerData = TribePlayerData(opts)
      const morePlayerData = MorePlayerData(opts)
      const triggers = Triggers(opts)
      const scripts = Scripts(opts)
      cb(null, {
        pre,
        header,
        messages,
        playerData,
        victory,
        diplomacy,
        techTree,
        map,
        tribePlayerData,
        morePlayerData,
        triggers,
        scripts
      })
    })
  }
}

module.exports = (nameOrBuffer) => new SCX(nameOrBuffer)
