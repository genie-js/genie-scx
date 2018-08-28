const test = require('tape')
const path = require('path')
const SCX = require('../src/SCX')

test('real_world_france', (t) => {
  SCX(path.join(__dirname, 'files/real_world_france.scx')).parse((err) => {
    t.ifError(err)
    t.end()
  })
})
