CREATE TABLE IF NOT EXISTS market_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  btc_spot_price REAL,
  btc_perp_price REAL,
  btc_volume_24h REAL,
  btc_oi REAL,
  btc_funding_rate REAL,
  btc_basis REAL,
  dxy REAL,
  us2y REAL,
  us10y REAL,
  nq REAL,
  spx REAL,
  gold REAL,
  etf_net_flow_usd REAL,
  stablecoin_net_flow REAL,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS regime_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  market_regime TEXT NOT NULL,
  primary_drivers TEXT NOT NULL,
  secondary_drivers TEXT NOT NULL,
  risk_environment TEXT NOT NULL,
  btc_state TEXT NOT NULL,
  regime_shift_probability REAL NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  notes TEXT,
  llm_summary TEXT,
  snapshot_id INTEGER REFERENCES market_snapshots(id)
);

CREATE TABLE IF NOT EXISTS x_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  asset TEXT NOT NULL DEFAULT 'BTC',
  event_type TEXT NOT NULL,
  source_tier TEXT NOT NULL,
  source_credibility_score REAL NOT NULL DEFAULT 0,
  headline TEXT NOT NULL,
  novelty TEXT NOT NULL DEFAULT 'new',
  first_order_event INTEGER NOT NULL DEFAULT 1,
  btc_bias TEXT NOT NULL DEFAULT 'unclear',
  urgency INTEGER NOT NULL DEFAULT 1,
  confidence REAL NOT NULL DEFAULT 0,
  raw_json TEXT
);

CREATE TABLE IF NOT EXISTS trigger_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  asset TEXT NOT NULL DEFAULT 'BTC',
  triggered INTEGER NOT NULL DEFAULT 0,
  trigger_type TEXT,
  price_zscore REAL,
  volume_zscore REAL,
  oi_shift REAL,
  funding_shift REAL,
  basis_shift REAL,
  liquidation_intensity REAL,
  x_resonance REAL,
  case_label TEXT,
  priority TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS trade_advice (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  advice_level TEXT NOT NULL,
  rationale TEXT,
  regime_snapshot_id INTEGER REFERENCES regime_snapshots(id),
  trigger_snapshot_id INTEGER REFERENCES trigger_snapshots(id)
);

CREATE TABLE IF NOT EXISTS shadow_book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_advice_id INTEGER NOT NULL REFERENCES trade_advice(id),
  entry_price REAL NOT NULL,
  exit_price REAL,
  direction TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS step_snapshots (
  step_key TEXT PRIMARY KEY,
  module_state TEXT NOT NULL DEFAULT 'idle',
  last_updated_at TEXT,
  payload_json TEXT
);
