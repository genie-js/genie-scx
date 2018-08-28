const struct = require('awestruct')
const t = struct.types

let version = 1.00

const dynamicString = (sizeType) =>
  struct([
    ['length', sizeType],
    ['string', t.string('length')]
  ]).map(
    (s) => s.string,
    (string) => ({ length: string.length, string })
  )

const PreHeader = struct([
  ['version', t.string(4)],
  ['headerLength', t.uint32],
  t.skip(4),
  ['timestamp', t.uint32],
  ['instructions', dynamicString(t.uint32)],
  t.skip(4),
  ['numPlayers', t.uint32]
])

const PlayerMeta = struct([
  ['active', t.uint32],
  ['human', t.uint32],
  ['civilization', t.uint32],
  t.skip(4)
])

const trim = (s) => s.replace(/\0+$/, '')
const untrim = (l) => (s) => s + '\0'.repeat(l - s.length)

const CompressedHeader = struct([
  ['nextObjectId', t.uint32],
  ['version', t.float],
  ['playerNames', t.array(16, t.string(256).map(trim, untrim(256)))],
  ['playerNameIds', t.array(16, t.int32)],
  ['playerMetas', t.array(16, PlayerMeta)],
  t.skip(4),
  t.skip(1),
  t.skip(4),
  ['filename', dynamicString(t.uint16)]
])

const Picture = struct([
  ['state', t.uint32],
  ['width', t.int32],
  ['height', t.int32],
  t.skip(2),
  t.if(s => s.width > 0 && s.height > 0, struct([
    ['header', struct([
      ['fileSize', t.uint32],
      ['reserved', t.uint32],
      ['offset', t.int32],
      ['headerSize', t.uint32],
      ['width', t.uint32],
      ['height', t.int32],
      ['planes', t.int16],
      ['bitPP', t.uint16],
      ['compress', t.uint32],
      ['rawSize', t.uint32],
      ['hr', t.uint32],
      ['vr', t.uint32],
      ['colors', t.uint32],
      ['importantColors', t.uint32],
      t.if(s => s.bitPP < 15, struct([
        ['palette', t.array(s => s.$parent.colors === 0 ? 1 << s.$parent.bitPP : s.$parent.colors, struct([
          ['red', t.uint8],
          ['green', t.uint8],
          ['blue', t.uint8],
          ['quad', t.uint8]
        ]))]
      ]))
    ])]
  ]))
])

const Messages = struct([
  ['instructionsId', t.int32],
  ['hintsId', t.int32],
  ['victoryId', t.int32],
  ['lossId', t.int32],
  ['historyId', t.int32],
  t.if(() => version >= 1.22, struct([
    ['scoutsId', t.int32]
  ])),
  ['instructions', dynamicString(t.uint16)],
  ['hints', dynamicString(t.uint16)],
  ['victory', dynamicString(t.uint16)],
  ['loss', dynamicString(t.uint16)],
  ['history', dynamicString(t.uint16)],
  t.if(() => version >= 1.22, struct([
    ['scouts', dynamicString(t.uint16)]
  ])),
  ['pregameFilename', dynamicString(t.uint16)],
  ['victoryFilename', dynamicString(t.uint16)],
  ['lossFilename', dynamicString(t.uint16)],
  ['backgroundFilename', dynamicString(t.uint16)],
  ['picture', Picture]
])

const PlayerData = struct([
  ['aiNames', t.array(16, dynamicString(t.uint16))],
  ['ctyNames', t.array(16, dynamicString(t.uint16))],
  ['perNames', t.array(16, dynamicString(t.uint16))],
  ['aiFiles', t.array(16, struct([
    ['aiLength', t.uint32],
    ['ctyLength', t.uint32],
    ['perLength', t.uint32],
    ['ai', t.string('aiLength')],
    ['cty', t.string('ctyLength')],
    ['per', t.string('perLength')]
  ]))],
  ['aiTypes', t.array(16, t.uint8)],
  t.skip(4),
  ['resources', t.array(16, struct([
    ['gold', t.uint32],
    ['wood', t.uint32],
    ['food', t.uint32],
    ['stone', t.uint32],
    ['ore', t.uint32],
    ['goods', t.uint32]
  ]))]
])

const GlobalVictory = struct([
  t.skip(4),
  ['conquest', t.uint32],
  t.skip(4),
  ['relics', t.uint32],
  t.skip(4),
  ['exploration', t.uint32],
  t.skip(4),
  ['allConditions', t.uint32],
  t.if(() => version >= 1.13, struct([
    ['mode', t.uint32],
    ['score', t.uint32],
    ['time', t.uint32]
  ]))
])

const Diplomacy = struct([
  ['diplomacy', t.array(16, t.array(16, t.uint32))],
  t.skip(16 * 720),
  t.skip(4),
  ['alliedVictory', t.array(16, t.uint32)]
])

const TechTree = struct([
  ['disabledTechCount', t.array(16, t.int32)],
  ['disabledTechIds', t.array(16, t.array(() => version >= 1.30 ? 60 : 30, t.int32))],
  ['disabledUnitCount', t.array(16, t.int32)],
  ['disabledUnitIds', t.array(16, t.array(() => version >= 1.30 ? 60 : 30, t.int32))],
  ['disabledBuildingCount', t.array(16, t.int32)],
  ['disabledBuildingIds', t.array(16, t.array(() => version >= 1.30 ? 60 : 20, t.int32))],
  t.skip(4),
  t.skip(4),
  ['allTechs', t.int32],
  ['startingAge', t.array(16, t.int32)]
])

const MapData = struct([
  t.skip(4),
  ['camera', struct([
    ['x', t.int32],
    ['y', t.int32]
  ])],
  ['mapType', t.int32],
  ['width', t.uint32],
  ['height', t.uint32],
  ['tiles', t.array('height', t.array('width', struct([
    ['terrain', t.uint8],
    ['elevation', t.uint8],
    ['zone', t.uint8]
  ])))]
])

module.exports = {
  PreHeader,
  CompressedHeader,
  Messages,
  PlayerData,
  GlobalVictory,
  Diplomacy,
  TechTree,
  MapData,
  version (v) { version = v }
}
