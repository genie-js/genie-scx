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

exports.load = (buffer, cb) => {
  const pre = PreHeader.decode(buffer)
  inflate(buffer.slice(PreHeader.decode.bytes), (err, uncompressed) => {
    if (err) return cb(err)

    let offset = 0
    const header = CompressedHeader.decode(uncompressed, offset)
    offset += CompressedHeader.decode.bytes
    // let structs know about the current version.
    version(header.version)

    const messages = Messages.decode(uncompressed, offset)
    offset += Messages.decode.bytes

    const playerData = PlayerData.decode(uncompressed, offset)
    offset += PlayerData.decode.bytes

    const victory = GlobalVictory.decode(uncompressed, offset)
    offset += GlobalVictory.decode.bytes

    const diplomacy = Diplomacy.decode(uncompressed, offset)
    offset += Diplomacy.decode.bytes

    const techTree = TechTree.decode(uncompressed, offset)
    offset += TechTree.decode.bytes

    const map = MapData.decode(uncompressed, offset)
    offset += MapData.decode.bytes

    const tribePlayerData = TribePlayerData.decode(uncompressed, offset)
    offset += TribePlayerData.decode.bytes

    const morePlayerData = MorePlayerData.decode(uncompressed, offset)
    offset += MorePlayerData.decode.bytes

    const triggers = Triggers.decode(uncompressed, offset)
    offset += Triggers.decode.bytes

    const scripts = Scripts.decode(uncompressed, offset)
    offset += Scripts.decode.bytes

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
