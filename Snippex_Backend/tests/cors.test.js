const test = require('node:test')
const assert = require('node:assert/strict')

const { buildCorsOptions } = require('../src/config/cors')

test('allows configured origins and denies others', () => {
  const corsOptions = buildCorsOptions('https://app.example.com, https://admin.example.com')

  assert.equal(corsOptions.origin('https://app.example.com', (err, allowed) => [err, allowed])[1], true)
  assert.equal(corsOptions.origin('https://admin.example.com', (err, allowed) => [err, allowed])[1], true)
  assert.equal(corsOptions.origin('https://evil.example.com', (err, allowed) => [err, allowed])[1], false)
})

test('allows requests without origin and ignores empty config', () => {
  const corsOptions = buildCorsOptions('')

  assert.equal(corsOptions.origin(undefined, (err, allowed) => [err, allowed])[1], true)
  assert.equal(corsOptions.origin(null, (err, allowed) => [err, allowed])[1], true)
})
