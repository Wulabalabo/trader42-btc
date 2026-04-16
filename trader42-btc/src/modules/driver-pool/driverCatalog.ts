import type { DriverCatalogEntry } from './driver.types.js';

export const DRIVER_CATALOG: DriverCatalogEntry[] = [
  {
    key: 'fed-rates',
    driverType: 'macro',
    dataSources: ['openbb-calendar', 'openbb-treasury'],
    description: 'Fed, USD, and rates path are the dominant BTC driver.',
    watchSignals: ['FOMC timing', 'DXY', 'US2Y'],
    historicalHitRate: 0.62,
  },
  {
    key: 'etf-flow',
    driverType: 'flow',
    dataSources: ['aktools-etf-flow'],
    description: 'ETF inflow or outflow is shaping BTC spot demand.',
    watchSignals: ['ETF net flow', 'US session spot bid', 'basis'],
    historicalHitRate: 0.74,
  },
  {
    key: 'positioning-squeeze',
    driverType: 'positioning',
    dataSources: ['binance-oi', 'binance-funding', 'binance-liquidations'],
    description: 'Derivatives positioning is forcing directional BTC moves.',
    watchSignals: ['OI change', 'funding rate', 'liquidations'],
    historicalHitRate: 0.58,
  },
  {
    key: 'regulation-event',
    driverType: 'event',
    dataSources: ['twitter-list-a'],
    description: 'Regulatory or policy headlines are moving BTC expectations.',
    watchSignals: ['official filings', 'policy headlines'],
    historicalHitRate: 0.55,
  },
  {
    key: 'institution-reserve',
    driverType: 'event',
    dataSources: ['twitter-list-a', 'twitter-list-c'],
    description: 'Corporate or institutional reserve buying is driving BTC.',
    watchSignals: ['treasury announcements', 'corporate purchase sizes'],
    historicalHitRate: 0.57,
  },
  {
    key: 'safe-haven-geopolitics',
    driverType: 'narrative',
    dataSources: ['openbb-macro', 'twitter-list-a'],
    description: 'A safe-haven narrative is reframing BTC demand.',
    watchSignals: ['geopolitical escalation', 'gold', 'DXY'],
    historicalHitRate: 0.43,
  },
  {
    key: 'onchain-supply',
    driverType: 'flow',
    dataSources: ['aktools-onchain'],
    description: 'Supply changes or inventory migration are affecting BTC flow.',
    watchSignals: ['exchange inventory', 'large wallet transfers'],
    historicalHitRate: 0.48,
  },
  {
    key: 'narrative-unconfirmed',
    driverType: 'narrative',
    dataSources: ['twitter-list-b', 'twitter-list-c'],
    description: 'A hot BTC narrative is spreading without hard confirmation.',
    watchSignals: ['source spread', 'price confirmation', 'funding'],
    historicalHitRate: 0.29,
  },
];

export const DRIVER_CATALOG_BY_KEY = Object.fromEntries(
  DRIVER_CATALOG.map((driver) => [driver.key, driver]),
) as Record<string, DriverCatalogEntry>;
