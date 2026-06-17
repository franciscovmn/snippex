const test = require('node:test')
const assert = require('node:assert/strict')

const controllerPath = require.resolve('../src/controllers/snippetController')
const snippetRepositoryPath = require.resolve('../src/repositories/snippetRepository')
const subscriptionRepositoryPath = require.resolve('../src/repositories/subscriptionRepository')

function createRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

function loadController({ subscription, usage }) {
  delete require.cache[controllerPath]
  delete require.cache[snippetRepositoryPath]
  delete require.cache[subscriptionRepositoryPath]

  const createdSnippets = []

  require.cache[snippetRepositoryPath] = {
    id: snippetRepositoryPath,
    filename: snippetRepositoryPath,
    loaded: true,
    exports: {
      getUsageByUser: async () => usage,
      createSnippet: async (payload) => {
        const snippet = {
          id: 'snippet-1',
          explanation: null,
          ...payload,
        }
        createdSnippets.push(snippet)
        return snippet
      },
    },
  }

  require.cache[subscriptionRepositoryPath] = {
    id: subscriptionRepositoryPath,
    filename: subscriptionRepositoryPath,
    loaded: true,
    exports: {
      getSubscriptionByUserId: async () => subscription,
    },
  }

  const controller = require('../src/controllers/snippetController')
  return { controller, createdSnippets }
}

test('blocks snippet creation when the plan total limit is reached', async () => {
  const { controller, createdSnippets } = loadController({
    subscription: { plan_id: 'free' },
    usage: { totalSnippets: 10, aiExplanationSnippets: 4 },
  })

  const res = createRes()
  await controller.create({
    user: { id: 'user-1', team_id: null },
    body: {
      title: 'Limit test',
      type: 'code',
      language: 'js',
      code: 'console.log("x")',
      visibility: 'PRIVATE',
    },
  }, res)

  assert.equal(res.statusCode, 403)
  assert.equal(createdSnippets.length, 0)
  assert.match(res.body.error, /limite de 10 snippets/i)
})

test('keeps pending paid subscriptions on freemium limits until payment is active', async () => {
  const { controller, createdSnippets } = loadController({
    subscription: { plan_id: 'pro', status: 'pending_payment' },
    usage: { totalSnippets: 10, aiExplanationSnippets: 4 },
  })

  const res = createRes()
  await controller.create({
    user: { id: 'user-1', team_id: null },
    body: {
      title: 'Pending payment limit',
      type: 'code',
      language: 'js',
      code: 'console.log("x")',
      visibility: 'PRIVATE',
    },
  }, res)

  assert.equal(res.statusCode, 403)
  assert.equal(createdSnippets.length, 0)
  assert.match(res.body.error, /Freemium/)
})

test('creates a snippet without AI enrichment when the AI quota is reached', async () => {
  const originalFetch = global.fetch
  let fetchCalled = false
  process.env.N8N_WEBHOOK_SNIPPEX_ENRICH = 'https://n8n.example/webhook'
  global.fetch = async () => {
    fetchCalled = true
    return { ok: true }
  }

    try {
      const { controller, createdSnippets } = loadController({
      subscription: { plan_id: 'pro', status: 'active' },
      usage: { totalSnippets: 12, aiExplanationSnippets: 20 },
    })

    const res = createRes()
    await controller.create({
      user: { id: 'user-1', team_id: null },
      body: {
        title: 'No AI quota',
        type: 'code',
        language: 'ts',
        code: 'const x = 1',
        visibility: 'PRIVATE',
      },
    }, res)

    assert.equal(res.statusCode, 201)
    assert.equal(createdSnippets.length, 1)
    assert.equal(fetchCalled, false)
    assert.equal(res.body.ai_enrichment_skipped_reason, 'ai_quota_reached')
  } finally {
    global.fetch = originalFetch
    delete process.env.N8N_WEBHOOK_SNIPPEX_ENRICH
  }
})
