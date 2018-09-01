const test = require('tape')
const path = require('path')
const SCX = require('../src/SCX')

test('real_world_france', (t) => {
  SCX(path.join(__dirname, 'files/real_world_france.scx')).parse((err) => {
    t.ifError(err)
    t.end()
  })
})

test('Age of Heroes beta 1.3.5', (t) => {
  SCX(path.join(__dirname, 'files/Age of Heroes b1-3-5.scx')).parse((err) => {
    t.ifError(err)
    t.end()
  })
})
