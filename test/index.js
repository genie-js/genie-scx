const test = require('tape')
const fs = require('fs')
const path = require('path')
const genieScx = require('../src/SCX')

function read (p) {
  return fs.readFileSync(path.join(__dirname, p))
}

test('real_world_france', (t) => {
  genieScx.load(read('files/real_world_france.scx'), (err) => {
    t.ifError(err)
    t.end()
  })
})

test('Age of Heroes beta 1.3.5', (t) => {
  genieScx.load(read('files/Age of Heroes b1-3-5.scx'), (err) => {
    t.ifError(err)
    t.end()
  })
})
