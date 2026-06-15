const YAMPI_API_BASE_URL = 'https://api.dooki.com.br/v2'

function buildYampiApiHeaders(userToken, userSecretKey) {
  return {
    'Content-Type': 'application/json',
    'User-Token': userToken,
    'User-Secret-Key': userSecretKey,
  }
}

function buildWebhookRequestBody({ url, name, events }) {
  return { url, name, events }
}

function pickMerchantAlias(authMeResponse) {
  const merchants = authMeResponse?.data?.merchants?.data ?? []
  if (merchants.length === 0) return null

  const ownerMerchant = merchants.find((merchant) => merchant?.alias)
  return ownerMerchant?.alias ?? merchants[0]?.alias ?? null
}

function findMatchingWebhook(webhooksResponse, webhookUrl, webhookName) {
  const webhooks = webhooksResponse?.data ?? webhooksResponse ?? []
  return webhooks.find((webhook) => webhook?.url === webhookUrl || webhook?.name === webhookName) ?? null
}

async function fetchAuthenticatedUser({ userToken, userSecretKey }) {
  const response = await fetch(`${YAMPI_API_BASE_URL}/auth/me`, {
    method: 'POST',
    headers: buildYampiApiHeaders(userToken, userSecretKey),
  })

  if (!response.ok) {
    throw new Error(`Falha ao consultar auth/me (${response.status})`)
  }

  return response.json()
}

async function listYampiWebhooks({ alias, userToken, userSecretKey }) {
  const response = await fetch(`${YAMPI_API_BASE_URL}/${alias}/webhooks`, {
    method: 'GET',
    headers: buildYampiApiHeaders(userToken, userSecretKey),
  })

  if (!response.ok) {
    throw new Error(`Falha ao listar webhooks (${response.status})`)
  }

  return response.json()
}

async function getYampiWebhook({ alias, id, userToken, userSecretKey }) {
  const response = await fetch(`${YAMPI_API_BASE_URL}/${alias}/webhooks/${id}`, {
    method: 'GET',
    headers: buildYampiApiHeaders(userToken, userSecretKey),
  })

  if (!response.ok) {
    throw new Error(`Falha ao visualizar webhook (${response.status})`)
  }

  return response.json()
}

async function createYampiWebhook({ alias, userToken, userSecretKey, url, name, events }) {
  const response = await fetch(`${YAMPI_API_BASE_URL}/${alias}/webhooks`, {
    method: 'POST',
    headers: buildYampiApiHeaders(userToken, userSecretKey),
    body: JSON.stringify(buildWebhookRequestBody({ url, name, events })),
  })

  if (!response.ok && response.status !== 201) {
    const body = await response.text()
    throw new Error(`Falha ao criar webhook (${response.status}): ${body}`)
  }

  return response.json()
}

module.exports = {
  YAMPI_API_BASE_URL,
  buildYampiApiHeaders,
  buildWebhookRequestBody,
  pickMerchantAlias,
  findMatchingWebhook,
  fetchAuthenticatedUser,
  listYampiWebhooks,
  getYampiWebhook,
  createYampiWebhook,
}
