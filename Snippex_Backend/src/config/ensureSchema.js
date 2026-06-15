const pool = require('./database')

async function ensureSavedSnippetsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_snippets (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, snippet_id)
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_snippets_user_created
    ON saved_snippets(user_id, created_at DESC)
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_saved_snippets_snippet
    ON saved_snippets(snippet_id)
  `)
}

async function ensureUserSubscriptionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL DEFAULT 'free',
      billing_cycle TEXT,
      status TEXT NOT NULL DEFAULT 'free',
      checkout_url TEXT,
      yampi_order_id TEXT,
      yampi_order_number TEXT,
      yampi_customer_email TEXT,
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
      current_period_end TIMESTAMPTZ,
      activated_at TIMESTAMPTZ,
      canceled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status
    ON user_subscriptions(status, updated_at DESC)
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan
    ON user_subscriptions(plan_id, billing_cycle)
  `)
}

async function ensureYampiTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS yampi_webhook_events (
      id BIGSERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      merchant_alias TEXT,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      customer_id TEXT,
      payload JSONB NOT NULL,
      signature TEXT,
      received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_yampi_webhook_events_merchant_event
    ON yampi_webhook_events(merchant_alias, event, received_at DESC)
  `)

  await pool.query(`
    DELETE FROM yampi_webhook_events a
    USING yampi_webhook_events b
    WHERE a.signature IS NOT NULL
      AND a.signature = b.signature
      AND a.id < b.id
  `)

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_yampi_webhook_events_signature
    ON yampi_webhook_events(signature)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS yampi_customers (
      merchant_alias TEXT NOT NULL,
      yampi_customer_id TEXT NOT NULL,
      email TEXT,
      name TEXT,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      last_event TEXT,
      raw_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (merchant_alias, yampi_customer_id)
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_yampi_customers_email
    ON yampi_customers(email)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS yampi_orders (
      merchant_alias TEXT NOT NULL,
      yampi_order_id TEXT NOT NULL,
      order_number TEXT,
      customer_id TEXT,
      customer_email TEXT,
      customer_name TEXT,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      order_status TEXT,
      raw_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (merchant_alias, yampi_order_id)
    )
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_yampi_orders_customer_email
    ON yampi_orders(customer_email)
  `)
}

async function ensureSchema() {
  await ensureSavedSnippetsTable()
  await ensureUserSubscriptionsTable()
  await ensureYampiTables()
}

module.exports = { ensureSchema, ensureSavedSnippetsTable, ensureUserSubscriptionsTable }
