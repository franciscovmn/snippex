const {
  verifyYampiWebhookSignature,
  isRelevantYampiEvent,
  normalizeYampiWebhookPayload,
} = require('../integrations/yampi')
const yampiRepository = require('../repositories/yampiRepository')

async function handleYampiWebhook({
  rawBody,
  signature,
  secret,
  payload,
  repo = yampiRepository,
  allowedAlias = null,
}) {
  if (!secret) {
    return { statusCode: 500, body: { error: 'Webhook da Yampi não configurado.' } }
  }

  if (!verifyYampiWebhookSignature(rawBody, secret, signature)) {
    return { statusCode: 401, body: { error: 'Assinatura da Yampi inválida.' } }
  }

  const normalized = normalizeYampiWebhookPayload(payload)

  if (allowedAlias && normalized.merchantAlias !== allowedAlias) {
    return { statusCode: 200, body: { status: 'ignored', reason: 'merchant_alias_mismatch' } }
  }

  if (!isRelevantYampiEvent(normalized.event)) {
    return { statusCode: 200, body: { status: 'ignored', event: normalized.event } }
  }

  await repo.recordWebhookEvent({
    ...normalized,
    payload,
    signature,
  })

  if (normalized.event === 'customer.created') {
    await repo.upsertWebhookCustomer({
      ...normalized,
      payload,
      signature,
    })
    await repo.linkCustomerToLocalUser?.(normalized.customerEmail)
    return { statusCode: 200, body: { status: 'processed', event: normalized.event } }
  }

  await repo.upsertWebhookCustomer({
    ...normalized,
    payload,
    signature,
  })

  await repo.linkCustomerToLocalUser?.(normalized.customerEmail)

  if (normalized.resourceType === 'order') {
    await repo.upsertWebhookOrder({
      ...normalized,
      payload,
      signature,
    })
  }

  return { statusCode: 200, body: { status: 'processed', event: normalized.event } }
}

async function receiveYampiWebhook(req, res) {
  try {
    const result = await handleYampiWebhook({
      rawBody: req.rawBody ?? JSON.stringify(req.body),
      signature: req.header('X-Yampi-Hmac-SHA256'),
      secret: process.env.YAMPI_WEBHOOK_SECRET,
      payload: req.body,
      allowedAlias: process.env.YAMPI_STORE_ALIAS || null,
    })

    return res.status(result.statusCode).json(result.body)
  } catch (err) {
    console.error('[yampi webhook]', err)
    return res.status(500).json({ error: 'Erro ao processar webhook da Yampi.' })
  }
}

module.exports = {
  handleYampiWebhook,
  receiveYampiWebhook,
}
