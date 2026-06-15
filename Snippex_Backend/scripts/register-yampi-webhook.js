require('dotenv').config()

const {
  fetchAuthenticatedUser,
  pickMerchantAlias,
  listYampiWebhooks,
  getYampiWebhook,
  createYampiWebhook,
  findMatchingWebhook,
} = require('../src/integrations/yampiApi')

const DEFAULT_EVENTS = ['order.created', 'order.paid', 'order.status.updated', 'customer.created']

function parseEvents(rawValue) {
  if (!rawValue) return DEFAULT_EVENTS
  return rawValue
    .split(',')
    .map((event) => event.trim())
    .filter(Boolean)
}

async function main() {
  const userToken = process.env.YAMPI_USER_TOKEN
  const userSecretKey = process.env.YAMPI_USER_SECRET_KEY
  const aliasFromEnv = process.env.YAMPI_STORE_ALIAS || null
  const webhookUrl = process.env.YAMPI_WEBHOOK_URL || 'http://localhost:3000/api/integrations/yampi/webhook'
  const webhookName = process.env.YAMPI_WEBHOOK_NAME || 'Snippex Yampi'
  const events = parseEvents(process.env.YAMPI_WEBHOOK_EVENTS)

  if (!userToken || !userSecretKey) {
    throw new Error('Defina YAMPI_USER_TOKEN e YAMPI_USER_SECRET_KEY antes de rodar o script.')
  }

  const authMe = await fetchAuthenticatedUser({ userToken, userSecretKey })
  const merchantAlias = aliasFromEnv || pickMerchantAlias(authMe)

  if (!merchantAlias) {
    throw new Error('Não foi possível descobrir o alias da loja na resposta de auth/me.')
  }

  const webhooks = await listYampiWebhooks({ alias: merchantAlias, userToken, userSecretKey })
  const existing = findMatchingWebhook(webhooks, webhookUrl, webhookName)

  if (existing?.id) {
    const detailed = await getYampiWebhook({ alias: merchantAlias, id: existing.id, userToken, userSecretKey })
    console.log(JSON.stringify({
      action: 'existing',
      merchantAlias,
      webhookId: detailed.id,
      webhookName: detailed.name,
      webhookUrl: detailed.url,
      secretKey: detailed.secret_key ?? null,
      events,
      nextStep: detailed.secret_key
        ? 'Copie secretKey para YAMPI_WEBHOOK_SECRET no backend.'
        : 'O webhook existe, mas a API não retornou secret_key. Recrie o webhook no painel se necessário.',
    }, null, 2))
    return
  }

  const created = await createYampiWebhook({
    alias: merchantAlias,
    userToken,
    userSecretKey,
    url: webhookUrl,
    name: webhookName,
    events,
  })

  console.log(JSON.stringify({
    action: 'created',
    merchantAlias,
    webhookId: created.id,
    webhookName: created.name,
    webhookUrl: created.url,
    secretKey: created.secret_key ?? null,
    events,
    nextStep: created.secret_key
      ? 'Copie secretKey para YAMPI_WEBHOOK_SECRET no backend.'
      : 'A API não retornou secret_key; verifique o webhook no painel da Yampi.',
  }, null, 2))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
