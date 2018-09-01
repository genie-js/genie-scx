const struct = require('awestruct')
const t = struct.types

let version = 1.00

const PreHeader = struct([
  ['version', t.string(4)],
  ['headerLength', t.uint32],
  t.skip(4),
  ['timestamp', t.uint32],
  ['instructions', t.dynstring(t.uint32)],
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
  ['filename', t.dynstring(t.uint16)]
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
  ['instructions', t.dynstring(t.uint16)],
  ['hints', t.dynstring(t.uint16)],
  ['victory', t.dynstring(t.uint16)],
  ['loss', t.dynstring(t.uint16)],
  ['history', t.dynstring(t.uint16)],
  t.if(() => version >= 1.22, struct([
    ['scouts', t.dynstring(t.uint16)]
  ])),
  ['pregameFilename', t.dynstring(t.uint16)],
  ['victoryFilename', t.dynstring(t.uint16)],
  ['lossFilename', t.dynstring(t.uint16)],
  ['backgroundFilename', t.dynstring(t.uint16)],
  ['picture', Picture]
])

const PlayerData = struct([
  ['aiNames', t.array(16, t.dynstring(t.uint16))],
  ['ctyNames', t.array(16, t.dynstring(t.uint16))],
  ['perNames', t.array(16, t.dynstring(t.uint16))],
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

const Objects = struct([
  ['objectsCount', t.uint32],
  ['objects', t.array('objectsCount', struct([
    ['x', t.float],
    ['y', t.float],
    ['z', t.float],
    ['id', t.int32],
    ['type', t.int16],
    ['state', t.uint8],
    ['angle', t.float],
    ['frame', t.int16],
    ['garrisonedIn', t.int32]
  ]))]
]).map(
  (s) => s.objects,
  (objects) => ({ objects, objectsCount: objects.length })
)

const TribePlayerData = struct([
  ['playerCount', t.uint32],
  ['playerResources', t.array(8, struct([
    ['food', t.float],
    ['wood', t.float],
    ['gold', t.float],
    ['stone', t.float],
    ['ore', t.float],
    ['goods', t.float],
    ['population', t.float]
  ]))],
  ['playerObjects', t.array('playerCount', Objects)]
])

const VictoryConditions = struct([
  ['version', t.float],
  ['conditionsCount', t.int32],
  ['unknown', t.int8],
  ['conditions', t.array('conditionsCount', struct([
    // TODO
    t.skip(44)
  ]))],
  t.if(s => s.version >= 1.0, struct([
    t.skip(4),
    ['count', t.int32],
    t.if(s => s.$parent.version >= 2.0, t.skip(8)),
    // Additional victory conditions
    t.skip(s => s.count * (s.$parent.version >= 2.0 ? 32 : 24))
  ]))
])

const ScenarioPlayer = struct([
  ['name', t.dynstring(t.uint16)],
  ['viewX', t.float],
  ['viewY', t.float],
  ['terrainX', t.int16],
  ['terrainY', t.int16],
  ['alliedVictory', t.bool],
  ['diploCount', t.int16],
  ['diplo1', t.array('diploCount', t.int8)],
  ['diplo2', t.array('diploCount', t.int32)],
  t.if(() => version >= 1.13, struct([
    ['color', t.int32]
  ])),
  ['victory', VictoryConditions]
])

const MorePlayerData = struct([
  ['playerCount', t.uint32],
  ['data', t.array(8, ScenarioPlayer)]
])

const TriggerEffect = struct([
  ['type', t.int32],
  ['check', t.int32],
  ['aiGoal', t.int32],
  ['amount', t.int32],
  ['resource', t.int32],
  ['diplomacy', t.int32],
  ['selectedCount', t.int32],
  ['locationUnitId', t.int32],
  ['unitType', t.int32],
  ['sourcePlayer', t.int32],
  ['targetPlayer', t.int32],
  ['technology', t.int32],
  ['stringId', t.int32],
  ['unk', t.int32],
  ['displayTime', t.int32],
  ['targetTrigger', t.int32],
  ['location', struct({ x: t.int32, y: t.int32 })],
  ['area', struct([
    ['bottomLeftX', t.int32],
    ['bottomLeftY', t.int32],
    ['topRightX', t.int32],
    ['topRightY', t.int32]
  ])],
  ['unitGroup', t.int32],
  ['unitType', t.int32],
  ['instructionPanel', t.int32],
  ['text', t.dynstring(t.int32)],
  ['soundFile', t.dynstring(t.int32)],
  ['unitIds', t.array(s => s.selectedCount, t.int32)]
])

const TriggerCondition = struct([
  ['type', t.int32],
  ['check', t.int32],
  ['amount', t.int32],
  ['resource', t.int32],
  ['unitId', t.int32],
  ['locationUnitId', t.int32],
  ['unitType', t.int32],
  ['player', t.int32],
  ['technology', t.int32],
  ['timer', t.int32],
  ['unknown', t.int32],
  ['area', struct([
    ['bottomLeftX', t.int32],
    ['bottomLeftY', t.int32],
    ['topRightX', t.int32],
    ['topRightY', t.int32]
  ])],
  ['unitGroup', t.int32],
  ['unitType', t.int32],
  ['aiSignal', t.int32]
])

const Trigger = struct([
  ['enabled', t.int32],
  ['looping', t.bool],
  ['nameId', t.int32],
  ['isObjective', t.bool],
  ['objectiveOrder', t.int32],
  ['startTime', t.int32],
  ['description', t.dynstring(t.int32)],
  ['name', t.dynstring(t.int32)],
  ['effects', t.dynarray(t.int32, TriggerEffect)],
  ['effectOrder', t.array(s => s.effects.length, t.int32)],
  ['conditions', t.dynarray(t.int32, TriggerCondition)],
  ['conditionOrder', t.array(s => s.conditions.length, t.int32)]
])

const Triggers = struct([
  ['version', t.double],
  t.if(s => s.version >= 1.5, struct([
    ['objectivesState', t.int8]
  ])),
  ['triggers', t.dynarray(t.int32, Trigger)],
  ['triggerOrder', t.array(s => s.triggers.length, t.int32)]
])

const Scripts = struct([
  ['hasScripts', t.int32],
  ['hasError', t.int32],
  t.if('hasError', struct([
    ['error', t.string(0x18C)]
  ])),
  t.if('hasScripts', struct([
    ['scripts', t.dynarray(t.int32, struct([
      ['filename', t.dynstring(t.int32)],
      ['data', t.dynstring(t.int32)]
    ]))]
  ]))
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
  TribePlayerData,
  MorePlayerData,
  Triggers,
  Scripts,
  version (v) { version = v }
}
