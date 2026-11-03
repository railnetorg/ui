import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  CircleDotDashedIcon,
  Coins01Icon,
  Copy01Icon,
  CubeIcon,
  InformationCircleIcon,
  Link01Icon,
  LinkSquare02Icon,
  PackageIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AssessmentBadge, LevelGlyph, Mark, ProjectBadge, type RiskCheck, type RiskLevel } from '@preview/risk/shared';
import { type ReactNode, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const VAULT = {
  name: 'Steakhouse USDC',
  asset: 'USDC',
  protocol: 'Morpho',
  curator: 'Steakhouse',
  chain: 'Ethereum',
  tvl: '$412.8M',
  tvlNative: '412.6M USDC',
  available: '$61.3M',
  availablePct: '14.9% of TVL',
  sharePrice: '1.0842 USDC',
  apy: '5.84%',
};

type Factor = { label: string; level: RiskLevel; value: string };

/** A market's five factors, in the order marketRiskChecks assembles them. */
function marketFactors(oracle: RiskLevel, lltv: RiskLevel, util: RiskLevel, dev: RiskLevel, vol: RiskLevel) {
  return [
    { label: 'Oracle', level: oracle, value: 'Chainlink · market price' },
    { label: 'Oracle deviation', level: dev, value: '+0.12% vs market · quoted 2h ago' },
    { label: 'LLTV', level: lltv, value: '86%' },
    { label: 'Utilization', level: util, value: '91% / 90% target' },
    { label: 'Volatility', level: vol, value: '38.4% annualized' },
  ] satisfies Factor[];
}

const asChecks = (factors: Factor[]): RiskCheck[] =>
  factors.map((f) => ({ label: f.label, level: f.level, detail: f.value }));

type Holding = {
  key: string;
  label: string;
  kind: 'market' | 'vault' | 'asset';
  pct: number;
  usd: number;
  collaterals: string[];
  checks: RiskCheck[];
};

const HOLDINGS: Holding[] = [
  {
    key: 'wsteth',
    label: 'wstETH/USDC',
    kind: 'market',
    pct: 31.2,
    usd: 128.8e6,
    collaterals: ['wstETH'],
    checks: asChecks(marketFactors('low', 'low', 'medium', 'low', 'low')),
  },
  {
    key: 'cbbtc',
    label: 'cbBTC/USDC',
    kind: 'market',
    pct: 22.4,
    usd: 92.5e6,
    collaterals: ['cbBTC'],
    checks: asChecks(marketFactors('low', 'low', 'low', 'low', 'low')),
  },
  {
    key: 'wbtc',
    label: 'WBTC/USDC',
    kind: 'market',
    pct: 14.1,
    usd: 58.2e6,
    collaterals: ['WBTC'],
    checks: asChecks(marketFactors('low', 'low', 'low', 'medium', 'low')),
  },
  {
    key: 'susde',
    label: 'sUSDe/USDC',
    kind: 'market',
    pct: 11.8,
    usd: 48.7e6,
    collaterals: ['sUSDe'],
    checks: asChecks(marketFactors('medium', 'high', 'medium', 'low', 'low')),
  },
  {
    key: 'aave',
    label: 'Aave v3 USDC',
    kind: 'market',
    pct: 9.6,
    usd: 39.6e6,
    collaterals: ['WETH', 'wstETH', 'WBTC', 'cbBTC', 'weETH', 'LINK', 'AAVE'],
    checks: asChecks(marketFactors('low', 'low', 'low', 'low', 'medium')),
  },
  {
    key: 'pt',
    label: 'PT-sUSDE-27NOV/USDC',
    kind: 'market',
    pct: 9.1,
    usd: 37.6e6,
    collaterals: ['PT-sUSDE'],
    checks: asChecks(marketFactors('medium', 'medium', 'low', 'low', 'low')),
  },
  { key: 'idle', label: 'USDC', kind: 'asset', pct: 1.8, usd: 7.4e6, collaterals: [], checks: [] },
];

/** The detail page's ramp: darkest for the largest position, fading to the panel. */
function ramp(i: number, n: number) {
  const t = n <= 1 ? 0 : i / (n - 1);
  return `color-mix(in oklab, var(--primary) ${Math.round(100 - t * 80)}%, var(--card))`;
}

function fmtUsd(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(2)}`;
}

type FlowNode = { title: string; sub?: string; items?: { name: string; tokens: string[] }[]; detail?: string };

const FLOW: FlowNode[] = [
  {
    title: 'Deposit USDC',
    sub: 'Withdraw at any time, up to the available liquidity',
    detail:
      'Withdrawals are paid from idle cash and unborrowed supply in the markets; $61.3M can leave today without waiting for borrowers to repay.',
  },
  {
    title: 'Steakhouse USDC vault',
    sub: 'Curated by Steakhouse on Morpho',
    detail:
      'A MetaMorpho vault: the curator sets which markets it may lend into and the caps on each; allocators move the cash between them.',
  },
  {
    title: 'Lent into 6 markets',
    items: [
      { name: 'wstETH/USDC', tokens: ['wstETH', 'USDC'] },
      { name: 'cbBTC/USDC', tokens: ['cbBTC', 'USDC'] },
      { name: '+4', tokens: [] },
    ],
    detail:
      'Two thirds of the book is lent against ETH and BTC collateral; the rest against synthetic dollars and an Aave reserve.',
  },
  { title: 'Borrowers post collateral', sub: "Overcollateralised, liquidated at the market's LLTV" },
];
const FLOW_END: FlowNode = {
  title: 'Net APY 5.84%',
  sub: 'Interest paid by borrowers, after a 10% performance fee',
  detail: 'All of it is borrower interest: no token incentives are counted in the rate.',
};
const MORE_SOURCES = [
  { name: 'WBTC/USDC', tokens: ['WBTC', 'USDC'] },
  { name: 'sUSDe/USDC', tokens: ['sUSDe', 'USDC'] },
  { name: 'Aave v3 USDC', tokens: ['AAVE', 'USDC'] },
  { name: 'PT-sUSDE-27NOV/USDC', tokens: ['PT', 'USDC'] },
];

type Guide = { what: string; levels: { level: RiskLevel; when: string }[]; note?: string };

const GUIDES = {
  track_record: {
    what: 'Who manages the vault, and whether a regulator or an established protocol stands behind them.',
    levels: [
      { level: 'low', when: "A regulated entity, or the protocol's own governance." },
      { level: 'medium', when: 'An identified company, a DAO or a pseudonymous team.' },
      { level: 'high', when: 'No curator identified, or one of unknown type.' },
    ],
    note: 'When a vault lists several curators, the weakest one sets the level.',
  },
  safeguards: {
    what: "The checks between a change to the vault and depositors' funds: a timelock and a guardian.",
    levels: [
      { level: 'low', when: 'A timelock of a day or more, and a guardian who can cancel.' },
      { level: 'medium', when: 'A timelock without a guardian, or a guardian without a timelock.' },
      { level: 'high', when: 'Neither.' },
    ],
  },
  oracle: {
    what: "Who prices the collateral in the vault's funded markets, and how.",
    levels: [
      { level: 'low', when: "Priced from the collateral's own market, by Chainlink or RedStone feeds." },
      { level: 'medium', when: "An exchange rate, a cap, the issuer's stated value or Pendle PT pricing." },
      { level: 'high', when: 'A hardcoded price, or a Uniswap TWAP feed.' },
    ],
    note: 'Smaller markets rated worse are named in the evidence, but do not set the level.',
  },
  lltv: {
    what: 'The liquidation LTV: the loan-to-value at which a borrower against this collateral can be liquidated.',
    levels: [],
    note: 'Not rated here: the Liquidation probability column reads where the borrowers sit against it.',
  },
  backing: {
    what: 'What stands behind the collateral: a stake, a custodian, a hedge book.',
    levels: [
      { level: 'low', when: 'Native, or backed one to one with attested reserves.' },
      { level: 'medium', when: 'Custodial, or backed by a strategy that can lose money.' },
      { level: 'high', when: 'Unverified backing.' },
    ],
  },
  liquidation: {
    what: "The chance that a 30-day period liquidates more than 10% of this Morpho market's debt.",
    levels: [
      { level: 'low', when: 'Under 2% over 30 days.' },
      { level: 'medium', when: '2% to 5%.' },
      { level: 'high', when: '5% or more.' },
    ],
  },
} satisfies Record<string, Guide>;

type FactorRowData = {
  key: string;
  factor: string;
  level: RiskLevel;
  assessment?: string;
  detail: string;
  highlights?: string[];
  guide?: Guide;
  body?: ReactNode;
};

const ORACLE_TYPES = [
  {
    key: 'feed',
    type: 'Market feed',
    description: 'Chainlink or RedStone price of the collateral itself.',
    weight: '67.7%',
  },
  {
    key: 'rate',
    type: 'Exchange rate',
    description: "The issuer's redemption rate, times a USD feed.",
    weight: '11.8%',
  },
  { key: 'pt', type: 'Pendle PT pricing', description: 'Linear discount to maturity.', weight: '9.1%' },
];

const CORRELATION = [
  { key: 'eth', price: 'ETH', symbols: ['wstETH', 'WETH', 'weETH'], note: 'via Aave', pct: '35.8%' },
  { key: 'btc', price: 'BTC', symbols: ['cbBTC', 'WBTC'], pct: '36.5%' },
  { key: 'usde', price: 'USDe', symbols: ['sUSDe', 'PT-sUSDE'], pct: '20.9%' },
];

const COUNTERPARTIES = [
  { key: 'lido', label: 'Lido', sublabel: 'staking', symbols: ['wstETH'], pct: '31.2%' },
  { key: 'coinbase', label: 'Coinbase', sublabel: 'custodian', symbols: ['cbBTC'], pct: '22.4%' },
  { key: 'ethena', label: 'Ethena', sublabel: 'issuer', symbols: ['sUSDe', 'PT-sUSDE'], pct: '20.9%' },
  { key: 'bitgo', label: 'BitGo', sublabel: 'custodian', symbols: ['WBTC'], pct: '14.1%' },
];

const JURISDICTIONS = [
  { key: 'us', label: 'Regulated', sublabel: 'United States', symbols: ['cbBTC', 'WBTC'], pct: '36.5%' },
  { key: 'none', label: 'Unregulated', sublabel: 'protocol', symbols: ['wstETH', 'weETH'], pct: '33.6%' },
  { key: 'bvi', label: 'Offshore', sublabel: 'British Virgin Islands', symbols: ['sUSDe', 'PT-sUSDE'], pct: '20.9%' },
];

const VAULT_GROUPS: { title: string; wide?: boolean; rows: FactorRowData[] }[] = [
  {
    title: 'Structure & governance',
    rows: [
      {
        key: 'track',
        factor: 'Curator track record',
        level: 'medium',
        assessment: 'Identified company',
        detail: 'Steakhouse Financial, curating on Morpho since January 2024 across 14 vaults with no loss event.',
        highlights: ['no loss event'],
        guide: GUIDES.track_record,
      },
      {
        key: 'safeguards',
        factor: 'Safeguards',
        level: 'medium',
        assessment: 'Timelock, no guardian',
        detail: 'Allocation changes wait 3 days before they apply. No guardian can cancel a pending change.',
        highlights: ['3 days', 'No guardian'],
        guide: GUIDES.safeguards,
      },
      {
        key: 'leverage',
        factor: 'Leverage',
        level: 'low',
        assessment: 'None',
        detail: 'The vault supplies to lending markets and does not borrow.',
      },
    ],
  },
  {
    title: 'Diversification and correlation',
    rows: [
      {
        key: 'concentration',
        factor: 'Concentration',
        level: 'medium',
        detail: 'The largest market holds 31.2% of the vault; the top three hold 67.7%.',
        highlights: ['31.2% of the vault'],
      },
      {
        key: 'correlation',
        factor: 'Collateral correlation',
        level: 'medium',
        detail: '',
        body: <CorrelationTable />,
      },
    ],
  },
  {
    title: 'Liquidity & redemption',
    rows: [
      {
        key: 'exit',
        factor: 'Exit liquidity',
        level: 'low',
        assessment: 'Instant',
        detail: '$61.3M, 14.9% of TVL, can be withdrawn today; there is no redemption queue.',
        highlights: ['14.9% of TVL'],
      },
      {
        key: 'util',
        factor: 'Utilisation',
        level: 'medium',
        detail: 'Two markets run above their 90% target, wstETH/USDC at 91% and sUSDe/USDC at 94%.',
        highlights: ['sUSDe/USDC at 94%'],
      },
    ],
  },
  {
    title: 'Counterparty & regulatory',
    wide: true,
    rows: [
      {
        key: 'counterparty',
        factor: 'Counterparty concentration',
        level: 'medium',
        detail: '',
        body: <ExposureTable heading="Counterparty" shareHeading="Of collateral" rows={COUNTERPARTIES} />,
      },
      {
        key: 'regulatory',
        factor: 'Regulatory heterogeneity',
        level: 'low',
        detail: '',
        body: (
          <ExposureTable
            heading="Regulatory status"
            shareHeading="Of collateral"
            rows={JURISDICTIONS}
            note="The deposit asset's issuer, Circle, is not counted: it is the vault's denomination, not its collateral."
          />
        ),
      },
    ],
  },
  {
    title: 'Market risk',
    rows: [
      {
        key: 'oracle',
        factor: 'Oracle configuration',
        level: 'low',
        detail: '',
        guide: GUIDES.oracle,
        body: <OracleTypesTable />,
      },
      {
        key: 'liquidation',
        factor: 'Liquidation probability',
        level: 'high',
        assessment: 'Likely',
        detail: 'sUSDe/USDC: a 6.8% chance that a 30-day period liquidates more than 10% of its debt.',
        highlights: ['6.8% chance'],
        guide: GUIDES.liquidation,
      },
    ],
  },
];

type Reading = { label: string; level: RiskLevel; detail: string };
type Collateral = {
  key: string;
  symbol: string;
  share?: number;
  type: string | null;
  lltv: number | null;
  oracle: Reading | null;
  backing: Reading | null;
  liquidation: Reading | null;
};
type Position = {
  key: string;
  name: string;
  tokens: string[];
  pct: number;
  skipped: number;
  collaterals: Collateral[];
  note?: string;
};

const chainlink: Reading = { label: 'Chainlink', level: 'low', detail: 'Priced from a Chainlink market feed.' };

const POSITIONS: Position[] = [
  {
    key: 'wsteth',
    name: 'wstETH/USDC',
    tokens: ['wstETH', 'USDC'],
    pct: 31.2,
    skipped: 0,
    collaterals: [
      {
        key: 'wsteth',
        symbol: 'wstETH',
        type: 'Liquid staking',
        lltv: 0.86,
        oracle: chainlink,
        backing: { label: 'Lido stake', level: 'low', detail: 'Backed one to one by staked ETH on the beacon chain.' },
        liquidation: { label: '0.4%', level: 'low', detail: 'A 0.4% chance over 30 days, from the pair’s past year.' },
      },
    ],
  },
  {
    key: 'cbbtc',
    name: 'cbBTC/USDC',
    tokens: ['cbBTC', 'USDC'],
    pct: 22.4,
    skipped: 0,
    collaterals: [
      {
        key: 'cbbtc',
        symbol: 'cbBTC',
        type: 'Wrapped BTC',
        lltv: 0.86,
        oracle: chainlink,
        backing: { label: 'Custodial', level: 'medium', detail: 'BTC held by Coinbase Custody, attested monthly.' },
        liquidation: { label: '1.2%', level: 'low', detail: 'A 1.2% chance over 30 days.' },
      },
    ],
  },
  {
    key: 'aave',
    name: 'Aave v3 USDC',
    tokens: ['AAVE', 'USDC'],
    pct: 9.6,
    skipped: 4,
    collaterals: [
      {
        key: 'weth',
        symbol: 'WETH',
        share: 0.381,
        type: 'Native',
        lltv: 0.83,
        oracle: chainlink,
        backing: { label: 'Native', level: 'low', detail: 'Wrapped ether, redeemable one to one.' },
        liquidation: null,
      },
      {
        key: 'wsteth',
        symbol: 'wstETH',
        share: 0.24,
        type: 'Liquid staking',
        lltv: 0.95,
        oracle: { label: 'Exchange rate', level: 'medium', detail: "Lido's rate times the ETH/USD feed." },
        backing: { label: 'Lido stake', level: 'low', detail: 'Backed by staked ETH.' },
        liquidation: null,
      },
      {
        key: 'wbtc',
        symbol: 'WBTC',
        share: 0.175,
        type: 'Wrapped BTC',
        lltv: 0.78,
        oracle: chainlink,
        backing: { label: 'Custodial', level: 'medium', detail: 'BTC held by BitGo.' },
        liquidation: null,
      },
    ],
  },
  {
    key: 'susde',
    name: 'sUSDe/USDC',
    tokens: ['sUSDe', 'USDC'],
    pct: 11.8,
    skipped: 0,
    collaterals: [
      {
        key: 'susde',
        symbol: 'sUSDe',
        type: 'Synthetic dollar',
        lltv: 0.915,
        oracle: { label: 'Fixed price', level: 'medium', detail: 'USDe is priced at 1.00 USD, times the vault rate.' },
        backing: { label: 'Delta-neutral', level: 'medium', detail: 'Backed by hedged ETH and BTC positions.' },
        liquidation: {
          label: '6.8%',
          level: 'high',
          detail: 'A 6.8% chance over 30 days: borrowers sit close to LLTV.',
        },
      },
    ],
  },
  {
    key: 'idle',
    name: 'USDC',
    tokens: ['USDC'],
    pct: 1.8,
    skipped: 0,
    collaterals: [],
    note: 'Idle cash: no borrower.',
  },
];

const GOVERNANCE: { label: string; value: string; full?: string; help?: string }[] = [
  { label: 'Owner', value: '0x255c…1a6e', full: '0x255c7705e8bb334dfcae438197f7c4297aa21a6e' },
  {
    label: 'Curator',
    value: '0x827e…1e0c',
    full: '0x827e86072b06674a077f592a531dce4590ad1e0c',
    help: 'Sets which markets the vault may lend into and the cap on each.',
  },
  { label: 'Guardian', value: '—' },
  {
    label: 'Timelock',
    value: '3 days',
    help: 'How long a change to caps, the curator or the fee waits before it applies.',
  },
  { label: 'Allocator', value: '0xfd32…6b13', full: '0xfd32fa2ca22c76dd6e550706ad913fc6ce91c75d' },
  { label: 'Performance fee', value: '10.00%' },
  { label: 'Allocator', value: '0x0000…4e3b', full: '0x0000aeb716a0df7a9a1aad119b772644bc089e3b' },
  { label: 'Fee recipient', value: '0x2551…ab39', full: '0x255175e5a3c00fd56f9e4c7c8b17c43fa61eab39' },
  { label: 'Deployed', value: '24 December 2023' },
  { label: 'Upgradeable', value: 'No' },
];

const ROLES = [
  { name: 'DEFAULT_ADMIN_ROLE', label: 'Admin', holders: 1, can: 'Grants and revokes every other role.' },
  { name: 'CURATOR_ROLE', label: 'Curator', holders: 1, can: 'Adds markets and sets their caps, behind the timelock.' },
  {
    name: 'ALLOCATOR_ROLE',
    label: 'Allocator',
    holders: 2,
    can: 'Moves cash between the markets the curator allowed.',
  },
  { name: 'GUARDIAN_ROLE', label: 'Guardian', holders: 0, can: null },
];

const ASSET_GROUPS: { title: string; rows: FactorRowData[] }[] = [
  {
    title: 'Technical',
    rows: [
      {
        key: 'contract',
        factor: 'Smart contract',
        level: 'low',
        assessment: 'Audited',
        detail: 'Four audits since 2023, by Quantstamp, Zellic, Spearbit and Pashov; source verified.',
        highlights: ['Four audits'],
      },
      {
        key: 'upgrade',
        factor: 'Upgradeability',
        level: 'medium',
        assessment: 'Multisig upgradable',
        detail: 'A 4-of-7 multisig can upgrade the contract without a timelock.',
        highlights: ['without a timelock'],
      },
    ],
  },
  {
    title: 'Financial',
    rows: [
      {
        key: 'peg',
        factor: 'Peg stability',
        level: 'low',
        assessment: 'Stable',
        detail: 'USDe has stayed within 0.5% of a dollar over the last 90 days.',
      },
      {
        key: 'reserve',
        factor: 'Reserve fund',
        level: 'medium',
        detail: 'A $61M reserve fund covers 1.1% of supply against negative funding.',
        highlights: ['1.1% of supply'],
      },
    ],
  },
  {
    title: 'Institutional',
    rows: [
      {
        key: 'issuer',
        factor: 'Issuer',
        level: 'medium',
        assessment: 'Unregulated',
        detail: 'Ethena Labs, incorporated in the British Virgin Islands, holds no licence for USDe.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Shared bits of the page
// ---------------------------------------------------------------------------

function Icon({ icon, className }: { icon: Parameters<typeof HugeiconsIcon>[0]['icon']; className?: string }) {
  return <HugeiconsIcon icon={icon} className={cn('size-4', className)} />;
}

/** A token, protocol or chain logo at the page's 20px. */
function Logo({ label, className }: { label: string; className?: string }) {
  return <Mark label={label} className={cn('data-[size=sm]:size-5', className)} />;
}

/** The info glyph that opens a HoverCard: the header's stats, governance rows and the tier legend. */
function InfoHint({ label, size = 'size-4', children }: { label: string; size?: string; children: ReactNode }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`About ${label}`}
            className="size-5 cursor-default text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
          >
            <Icon icon={InformationCircleIcon} className={size} />
          </Button>
        }
      />
      <HoverCardContent align="start" className="w-80 font-normal text-xs">
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}

const ASSET_LINK_CLASS = 'underline decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground';

/** An asset's name, underlined at rest; it opens the asset page in the app. */
function AssetLink({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <button type="button" title={`Open the ${symbol} asset page`} className={cn(ASSET_LINK_CLASS, className)}>
      {symbol}
    </button>
  );
}

/** Token logos overlapped, the first laid over the second. */
function TokenStack({
  tokens,
  ringClassName = 'ring-card',
  size = 'sm',
}: {
  tokens: string[];
  ringClassName?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span className="isolate inline-flex shrink-0 items-center">
      {tokens.map((t, i) => (
        <span
          key={t}
          style={{ zIndex: tokens.length - i }}
          className={cn(
            'relative inline-flex rounded-full ring-1',
            ringClassName,
            i > 0 && (size === 'md' ? '-ml-2' : '-ml-1.5'),
          )}
        >
          <Mark label={t} className={size === 'md' ? 'data-[size=sm]:size-5' : 'data-[size=sm]:size-4'} />
        </span>
      ))}
    </span>
  );
}

/** The detail page's card: a tinted tray carrying the title, then a white panel inset by 2px. */
function TrayCard({
  title,
  icon,
  badge,
  suffix,
  band = false,
  className,
  children,
}: {
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  suffix?: string;
  band?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Card className={cn('h-auto gap-3 overflow-hidden border-0 bg-gray-25 p-0.5 pt-4', band && 'pb-4', className)}>
      <div className="flex items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-baseline gap-2">
          {icon && <span className="self-center">{icon}</span>}
          <span className="truncate font-medium text-base text-foreground">{title}</span>
          {suffix && <span className="shrink-0 font-normal text-muted-foreground text-sm">{suffix}</span>}
        </div>
        {badge}
      </div>
      {!band && (
        <div className="flex flex-1 flex-col gap-3 rounded-[calc(var(--radius)+4px)] bg-card p-4">{children}</div>
      )}
    </Card>
  );
}

/** A header figure: label (with an optional hint), a serif number and a line under it. */
function Stat({ label, value, sub, hint }: { label: string; value: string; sub?: string; hint?: ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 font-normal text-muted-foreground text-sm">
        {label}
        {hint && <InfoHint label={label}>{hint}</InfoHint>}
      </div>
      <div className="text-3xl text-foreground text-stat">{value}</div>
      {sub && <div className="mt-1 text-muted-foreground text-xs">{sub}</div>}
    </div>
  );
}

/** Position in the list the vault was reached from; up counts up, down counts down. */
function VaultPager({ index, total }: { index: number; total: number }) {
  const [at, setAt] = useState(index);
  return (
    <div className="flex items-center gap-1">
      <span className="px-1 text-sm tabular-nums">
        <span className="text-foreground">{at + 1}</span>
        <span className="text-muted-foreground"> / {total}</span>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next vault"
        className="size-6 text-muted-foreground hover:text-foreground"
        disabled={at >= total - 1}
        onClick={() => setAt(at + 1)}
      >
        <Icon icon={ArrowUp02Icon} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous vault"
        className="size-6 text-muted-foreground hover:text-foreground"
        disabled={at <= 0}
        onClick={() => setAt(at - 1)}
      >
        <Icon icon={ArrowDown02Icon} />
      </Button>
    </div>
  );
}

function ProtocolLinkButton({ target }: { target: string }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 gap-2"
      nativeButton={false}
      render={
        <a href="https://app.morpho.org" target="_blank" rel="noopener noreferrer">
          Open on {target === 'Railnet' ? 'Railnet App' : target}
          <Icon icon={LinkSquare02Icon} />
        </a>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Vault report — header and section nav
// ---------------------------------------------------------------------------

function VaultDetailHeader() {
  return (
    <div className="bg-background">
      <div className="px-6 pt-4">
        <div className="pt-3 pb-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl text-foreground text-stat">{VAULT.name}</h1>
            <div className="flex shrink-0 items-center gap-2">
              <VaultPager index={3} total={42} />
              <ProtocolLinkButton target={VAULT.protocol} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-foreground text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Logo label={VAULT.asset} />
              <AssetLink symbol={VAULT.asset} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Logo label={VAULT.protocol} />
              {VAULT.protocol}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Logo label={VAULT.curator.slice(0, 1)} />
              {VAULT.curator}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Logo label={VAULT.chain} />
              {VAULT.chain}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-x-[72px] gap-y-4 pt-4 pb-2">
          <Stat label="TVL" value={VAULT.tvl} sub={VAULT.tvlNative} />
          <Stat
            label="Available liquidity"
            value={VAULT.available}
            sub={VAULT.availablePct}
            hint={
              <>
                <p>
                  Supplied minus borrowed across the markets this vault is allocated to — what a depositor could
                  withdraw right now.
                </p>
                <p className="mt-2">
                  A high TVL with little available liquidity means the vault is heavily utilised: the assets are lent
                  out, not idle.
                </p>
                <p className="mt-2 text-muted-foreground">
                  This is protocol liquidity, not DEX depth — it does not say how easily the collateral behind those
                  markets could be sold in a liquidation.
                </p>
              </>
            }
          />
          <Stat label="Share price" value={VAULT.sharePrice} />
          <Stat label="Net APY" value={VAULT.apy} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function FlowRing({ end = false }: { end?: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 motion-reduce:transition-none',
        end ? 'border-primary' : 'border-gray-100 group-hover/step:border-primary',
      )}
    >
      <span
        className={cn(
          'size-2.5 rounded-full transition duration-200 ease-out motion-reduce:transition-none',
          end ? 'bg-primary/20 group-hover/step:bg-primary' : 'scale-0 bg-primary/20 group-hover/step:scale-100',
        )}
      />
    </span>
  );
}

/** The flow's "+N": hovering it names the sources it stands for, each with its logos. */
function MoreSources({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="cursor-default underline decoration-dotted underline-offset-2 outline-none focus-visible:text-foreground">
            {label}
          </span>
        }
      />
      <TooltipContent side="top" className="px-3.5 py-2.5">
        <ul className="space-y-2">
          {MORE_SOURCES.map((s) => (
            <li key={s.name} className="flex items-center gap-1.5">
              <TokenStack tokens={s.tokens} ringClassName="ring-foreground" size="md" />
              {s.name}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function FlowStep({
  node,
  open,
  onToggle,
  end = false,
}: {
  node: FlowNode;
  open: boolean;
  onToggle: () => void;
  end?: boolean;
}) {
  return (
    <li className="group/step flex gap-3">
      <div className="flex flex-col items-center gap-1">
        <FlowRing end={end} />
        {!end && <span className="mb-1 w-px flex-1 bg-gray-100" />}
      </div>
      <Collapsible open={open} onOpenChange={onToggle} className={cn('min-w-0 text-sm leading-5', !end && 'pb-4')}>
        <div className="flex flex-col items-start gap-0.5">
          {node.detail ? (
            <CollapsibleTrigger className="inline-flex items-center gap-0.5 text-left font-medium text-foreground">
              {node.title}
              <Icon
                icon={ArrowDown01Icon}
                className={cn(
                  'text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
                  open && 'rotate-180',
                )}
              />
            </CollapsibleTrigger>
          ) : (
            <span className="font-medium text-foreground">{node.title}</span>
          )}
          {node.items ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-normal text-muted-foreground">
              {node.items.map((item) => (
                <span key={item.name} className="inline-flex items-center gap-1.5">
                  {item.tokens.length > 0 && <TokenStack tokens={item.tokens} size="md" />}
                  {item.name.startsWith('+') ? <MoreSources label={item.name} /> : item.name}
                </span>
              ))}
            </span>
          ) : (
            node.sub && <span className="font-normal text-muted-foreground">{node.sub}</span>
          )}
        </div>
        {node.detail && (
          <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden opacity-100 transition-[height,opacity] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none">
            <p className="pt-1.5 font-normal text-muted-foreground">{node.detail}</p>
          </CollapsibleContent>
        )}
      </Collapsible>
    </li>
  );
}

function OverviewTab() {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const toggle = (i: number) => setOpenStep((o) => (o === i ? null : i));
  return (
    <div>
      <h2 className="mb-3 font-medium text-foreground text-lg">Overview</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TrayCard title="About">
          <div className="space-y-2">
            <p className="font-normal text-muted-foreground text-sm">
              Steakhouse USDC lends USDC on Morpho into six markets, two thirds of it against ETH and BTC collateral.
              The book is concentrated: the largest market holds 31.2%, and three hold 67.7%.
            </p>
            <p className="font-normal text-muted-foreground text-sm">
              Its main exposure is sUSDe/USDC, where borrowers sit close to the 91.5% LLTV and a liquidation over 30
              days is likely. Allocation changes wait three days, with no guardian to cancel them.
            </p>
          </div>
          <p className="mt-auto font-normal text-muted-foreground text-sm">
            Steakhouse AUM <span className="font-medium text-foreground">$1.92B</span>
          </p>
        </TrayCard>
        <TrayCard title="Money flow">
          <ol className="flex flex-col">
            {FLOW.map((node, i) => (
              <FlowStep key={node.title} node={node} open={openStep === i} onToggle={() => toggle(i)} />
            ))}
            <FlowStep node={FLOW_END} open={openStep === FLOW.length} onToggle={() => toggle(FLOW.length)} end />
          </ol>
        </TrayCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Holdings
// ---------------------------------------------------------------------------

type Slice = { id: string; label: string; value: number; color: string };

/** The allocation ring; its slices and the table rows light up together. */
function Donut({
  slices,
  hovered,
  onHoverSlice,
  height = 220,
  innerRadius = '58%',
  hideLegend = false,
}: {
  slices: Slice[];
  hovered?: string | null;
  onHoverSlice?: (id: string | null) => void;
  height?: number;
  innerRadius?: string;
  hideLegend?: boolean;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={hideLegend ? 'flex flex-col gap-4' : 'flex flex-col items-center gap-4 sm:flex-row'}>
      <div className={cn('flex justify-center', hideLegend ? 'w-full' : 'w-full sm:w-1/2')}>
        <PieChart width={height} height={height}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            innerRadius={innerRadius}
            outerRadius="85%"
            paddingAngle={1}
            stroke="none"
            isAnimationActive={false}
            onMouseEnter={(_, i) => onHoverSlice?.(slices[i]?.id ?? null)}
            onMouseLeave={() => onHoverSlice?.(null)}
          >
            {slices.map((s) => (
              <Cell key={s.id} fill={s.color} opacity={hovered && hovered !== s.id ? 0.3 : 1} />
            ))}
          </Pie>
        </PieChart>
      </div>
      {!hideLegend && (
        <ul className="flex w-full flex-1 flex-col gap-1 sm:w-1/2">
          {slices.map((s) => (
            <li
              key={s.id}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm',
                hovered && hovered !== s.id && 'opacity-50',
              )}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="truncate text-foreground">{s.label}</span>
              <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">{fmtUsd(s.value)}</span>
              <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                {((s.value / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const KIND = {
  vault: { label: 'Vault', icon: CubeIcon },
  market: { label: 'Market', icon: ArrowDataTransferHorizontalIcon },
  asset: { label: 'Asset', icon: Coins01Icon },
} as const;

function KindCell({ kind }: { kind: keyof typeof KIND }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon icon={KIND[kind].icon} className="shrink-0 text-muted-foreground" />
      {KIND[kind].label}
    </span>
  );
}

/** One collateral named and linked; several as a stack of logos with the full list on hover. */
function CollateralCell({ collaterals }: { collaterals: string[] }) {
  const [first] = collaterals;
  if (!first) return <>—</>;
  if (collaterals.length === 1) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Logo label={first} />
        <AssetLink symbol={first} className="truncate" />
      </span>
    );
  }
  const shown = collaterals.slice(0, 4);
  const rest = collaterals.length - shown.length;
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        closeDelay={80}
        render={
          <span className="inline-flex cursor-default items-center gap-2">
            <span className="inline-flex shrink-0 flex-row-reverse items-center pl-2">
              {[...shown].reverse().map((c) => (
                <span key={c} className="-ml-2 inline-flex rounded-full ring-2 ring-background">
                  <Logo label={c} />
                </span>
              ))}
            </span>
            <span className="text-muted-foreground text-sm">{rest > 0 ? `+${rest}` : collaterals.length}</span>
          </span>
        }
      />
      <HoverCardContent align="start" className="w-56 p-2">
        <p className="px-1 pb-1.5 text-muted-foreground text-xs">{collaterals.length} collateral assets</p>
        <div className="max-h-64 overflow-y-auto">
          {collaterals.map((c) => (
            <div key={c} className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm">
              <Logo label={c} />
              <AssetLink symbol={c} className="truncate" />
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/** ✓ Strengths / flag To review, as the explore table's hover card lists them. */
function RiskBreakdown({ checks }: { checks: RiskCheck[] }) {
  const groups = [
    { title: 'Strengths', level: 'low' as const, rows: checks.filter((c) => c.level === 'low') },
    { title: 'To review', level: 'high' as const, rows: checks.filter((c) => c.level !== 'low') },
  ];
  return (
    <div className="space-y-3">
      {groups
        .filter((g) => g.rows.length > 0)
        .map((g) => (
          <div key={g.title}>
            <div
              className={cn(
                'mb-1.5 flex items-center gap-1.5 font-medium text-sm',
                g.level === 'low' ? 'text-mint' : 'text-destructive',
              )}
            >
              <LevelGlyph level={g.level} className="size-4" />
              {g.title}
            </div>
            <ul className="space-y-2">
              {g.rows.map((c) => (
                <li key={c.label}>
                  <div className="font-medium text-foreground text-sm">{c.label}</div>
                  <div className="text-muted-foreground text-xs">{c.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

function RiskFactorsCell({ checks }: { checks: RiskCheck[] }) {
  const ok = checks.filter((c) => c.level === 'low').length;
  const flagged = checks.length - ok;
  if (checks.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={
          <span className="inline-flex cursor-default items-center gap-3 text-foreground">
            {ok > 0 && (
              <span className="flex items-center gap-1">
                <LevelGlyph level="low" className="size-4" />
                {ok}
              </span>
            )}
            {flagged > 0 && (
              <span className="flex items-center gap-1">
                <LevelGlyph level="high" className="size-4" />
                {flagged}
              </span>
            )}
          </span>
        }
      />
      <HoverCardContent align="end" className="w-80">
        <RiskBreakdown checks={checks} />
      </HoverCardContent>
    </HoverCard>
  );
}

const PAGE_SIZE = 6;

function HoldingsTab() {
  const [page, setPage] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const coloured = HOLDINGS.map((h, i) => ({ holding: h, color: ramp(i, HOLDINGS.length) }));
  const slices = coloured.map((c) => ({
    id: c.holding.key,
    label: c.holding.label,
    value: c.holding.usd,
    color: c.color,
  }));
  const pageCount = Math.ceil(coloured.length / PAGE_SIZE);
  const rows = coloured.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const total = HOLDINGS.reduce((s, h) => s + h.usd, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-medium text-foreground text-lg">Holdings</h2>
      </div>
      <div className="-mt-2 mb-4 font-normal text-muted-foreground text-sm">
        <p>Every market this vault lends into, with the collateral behind it.</p>
        <p>Click a collateral to open its asset page.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div>
          <div className="font-normal text-muted-foreground text-sm">Allocated</div>
          <div className="text-[30px] text-foreground text-stat">{fmtUsd(total)}</div>
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-[320px]">
              <Donut
                slices={slices}
                hideLegend
                height={280}
                innerRadius="72%"
                hovered={hovered}
                onHoverSlice={setHovered}
              />
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="min-h-[376px]">
            <Card className="gap-0 py-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">Position</TableHead>
                    <TableHead className="w-[11%]">Type</TableHead>
                    <TableHead className="w-[12%]">Allocation</TableHead>
                    <TableHead className="w-[13%]">Instrument</TableHead>
                    <TableHead className="w-[13%]">Collateral</TableHead>
                    <TableHead className="w-[12%]">Network</TableHead>
                    <TableHead className="w-[9%]">Balance</TableHead>
                    <TableHead className="w-[10%]">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ holding: h, color }) => (
                    <TableRow
                      key={h.key}
                      onMouseEnter={() => setHovered(h.key)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn('transition-colors', hovered === h.key && 'bg-muted')}
                    >
                      <TableCell className="text-foreground">
                        <span className="flex items-center gap-2 overflow-hidden">
                          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ background: color }} />
                          <span className="truncate">{h.label}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <KindCell kind={h.kind} />
                      </TableCell>
                      <TableCell>{h.pct}%</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Logo label={h.key === 'aave' ? 'Aave' : VAULT.protocol} />
                          {h.key === 'aave' ? 'Aave' : VAULT.protocol}
                        </span>
                      </TableCell>
                      <TableCell>
                        <CollateralCell collaterals={h.collaterals} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Logo label={VAULT.chain} />
                          <span className="truncate">{VAULT.chain}</span>
                        </span>
                      </TableCell>
                      <TableCell>{fmtUsd(h.usd)}</TableCell>
                      <TableCell>
                        <RiskFactorsCell checks={h.checks} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">{HOLDINGS.length} positions</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous positions"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <Icon icon={ArrowLeft02Icon} />
              </Button>
              <span className="text-muted-foreground text-sm tabular-nums">
                {page + 1}/{pageCount}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next positions"
                disabled={page === pageCount - 1}
                onClick={() => setPage(page + 1)}
              >
                <Icon icon={ArrowRight02Icon} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The elbow tying a tree row to the one it hangs from. */
function TreeElbow({ depth, isLast }: { depth: 1 | 2; isLast: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 w-3 text-muted-foreground/25',
        depth === 1 ? 'left-[22px]' : 'left-[46px]',
      )}
    >
      <span className={cn('absolute top-0 left-0 w-px bg-current', isLast ? 'h-[calc(50%-10px)]' : 'bottom-0')} />
      <svg
        className="absolute top-[calc(50%-10px)] left-0 h-[10px] w-3 overflow-visible"
        viewBox="0 0 12 10"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M0.5 0 C0.5 6.5 3 9.5 12 9.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </span>
  );
}

function TreeChevron({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? 'Hide' : 'Show'} ${label}`}
      className="size-4 text-muted-foreground hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent dark:hover:bg-transparent"
    >
      <Icon icon={ArrowRight01Icon} className={cn('size-3.5 transition-transform duration-150', open && 'rotate-90')} />
    </Button>
  );
}

type TreeRow = {
  key: string;
  label: string;
  kind: 'market' | 'vault';
  pct: string;
  protocol: string;
  collaterals: string[];
  usd: string;
  checks: RiskCheck[];
  children?: TreeRow[];
};

const RAILNET_TREE: TreeRow[] = [
  {
    key: 'steak',
    label: 'Steakhouse USDC',
    kind: 'vault',
    pct: '58.4%',
    protocol: 'Morpho',
    collaterals: [],
    usd: '$5.8K',
    checks: [],
    children: [
      {
        key: 'steak-wsteth',
        label: 'wstETH/USDC',
        kind: 'market',
        pct: '18.2%',
        protocol: 'Morpho',
        collaterals: ['wstETH'],
        usd: '$1.8K',
        checks: HOLDINGS[0]?.checks ?? [],
      },
      {
        key: 'steak-cbbtc',
        label: 'cbBTC/USDC',
        kind: 'market',
        pct: '13.1%',
        protocol: 'Morpho',
        collaterals: ['cbBTC'],
        usd: '$1.3K',
        checks: HOLDINGS[1]?.checks ?? [],
      },
    ],
  },
  {
    key: 'aave',
    label: 'Aave v3 USDC',
    kind: 'market',
    pct: '41.6%',
    protocol: 'Aave',
    collaterals: ['WETH', 'wstETH', 'WBTC', 'cbBTC', 'weETH', 'LINK'],
    usd: '$4.2K',
    checks: HOLDINGS[4]?.checks ?? [],
  },
];

/** A row that slides open and shut with its level: each cell's content in a box whose height goes to zero. */
function SlideCell({ shown, className, children }: { shown: boolean; className?: string; children: ReactNode }) {
  return (
    <TableCell
      className={cn('transition-[padding] duration-200 ease-out', className)}
      style={shown ? undefined : { paddingTop: 0, paddingBottom: 0 }}
    >
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-200 ease-out"
        style={{ maxHeight: shown ? '3rem' : 0, opacity: shown ? 1 : 0 }}
      >
        {children}
      </div>
    </TableCell>
  );
}

function TreeLeaf({
  row,
  depth,
  isLast,
  shown,
  open,
  onToggle,
}: {
  row: TreeRow;
  depth: 1 | 2;
  isLast: boolean;
  shown: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <TableRow
      aria-hidden={shown ? undefined : true}
      className={cn('border-0 bg-muted/30', !shown && 'pointer-events-none')}
    >
      <SlideCell shown={shown} className={cn('relative text-foreground', depth === 1 ? 'pl-10' : 'pl-16')}>
        <TreeElbow depth={depth} isLast={isLast} />
        <span className="flex items-center gap-1.5 overflow-hidden">
          {onToggle ? (
            <TreeChevron open={!!open} onToggle={onToggle} label={`the markets ${row.label} lends into`} />
          ) : null}
          <span className={cn('truncate', row.kind === 'vault' && 'font-medium')}>{row.label}</span>
        </span>
      </SlideCell>
      <SlideCell shown={shown} className="text-foreground">
        <KindCell kind={row.kind} />
      </SlideCell>
      <SlideCell shown={shown}>{row.pct}</SlideCell>
      <SlideCell shown={shown}>
        <span className="inline-flex items-center gap-1.5">
          <Logo label={row.protocol} />
          {row.protocol}
        </span>
      </SlideCell>
      <SlideCell shown={shown}>
        <CollateralCell collaterals={row.collaterals} />
      </SlideCell>
      <SlideCell shown={shown}>
        <span className="inline-flex items-center gap-1.5">
          <Logo label="Ethereum" />
          Ethereum
        </span>
      </SlideCell>
      <SlideCell shown={shown}>{row.usd}</SlideCell>
      <SlideCell shown={shown}>
        <RiskFactorsCell checks={row.checks} />
      </SlideCell>
    </TableRow>
  );
}

/** A Railnet product's holdings as the tree it is built as: the MultiVehicle, then what it holds. */
function RailnetHoldingsRows() {
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const toggle = (k: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (!next.delete(k)) next.add(k);
      return next;
    });
  const topOpen = !closed.has('top');
  return (
    <Card className="gap-0 py-0">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[22%]">Position</TableHead>
            <TableHead className="w-[13%]">Type</TableHead>
            <TableHead className="w-[10%]">Allocation</TableHead>
            <TableHead className="w-[12%]">Instrument</TableHead>
            <TableHead className="w-[12%]">Collateral</TableHead>
            <TableHead className="w-[12%]">Network</TableHead>
            <TableHead className="w-[9%]">Balance</TableHead>
            <TableHead className="w-[10%]">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="text-foreground">
            <TableCell>
              <span className="flex items-center gap-1.5 overflow-hidden">
                <TreeChevron open={topOpen} onToggle={() => toggle('top')} label="what CoinShares DeFi Income holds" />
                <span className="truncate font-medium">CoinShares DeFi Income</span>
              </span>
            </TableCell>
            <TableCell>
              <span className="flex min-w-0 items-center gap-1.5">
                <Icon icon={PackageIcon} className="shrink-0 text-muted-foreground" />
                <span className="truncate">
                  <RailnetTerm term="multivehicle">Multi-strategy vault</RailnetTerm>
                </span>
              </span>
            </TableCell>
            <TableCell>100%</TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5">
                <Logo label="Railnet" />
                Railnet
              </span>
            </TableCell>
            <TableCell>—</TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5">
                <Logo label="Ethereum" />
                Ethereum
              </span>
            </TableCell>
            <TableCell>$10.0K</TableCell>
            <TableCell className="text-muted-foreground">—</TableCell>
          </TableRow>
          {RAILNET_TREE.map((row, i) => {
            const isLast = i === RAILNET_TREE.length - 1;
            const open = !closed.has(row.key);
            return [
              <TreeLeaf
                key={row.key}
                row={row}
                depth={1}
                isLast={isLast}
                shown={topOpen}
                open={open}
                onToggle={row.children ? () => toggle(row.key) : undefined}
              />,
              ...(row.children ?? []).map((child, j, all) => (
                <TreeLeaf key={child.key} row={child} depth={2} isLast={j === all.length - 1} shown={topOpen && open} />
              )),
            ];
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Risk — the factor cards and the Holdings risk table (risk-factors-table)
// ---------------------------------------------------------------------------

/** The info button beside a factor's name: what it is, then each level and what puts a vault there. */
function FactorGuideTip({
  label,
  guide,
  className = 'ml-1 align-[-3px]',
}: {
  label: string;
  guide: Guide;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className={cn(
              className,
              'size-5 text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent',
            )}
          >
            <Icon icon={InformationCircleIcon} />
          </Button>
        }
      />
      <TooltipContent side="top" sideOffset={6} className="max-w-sm text-wrap px-3.5 py-3 text-left">
        <div className="space-y-3">
          <p>{guide.what}</p>
          {guide.levels.length > 0 && (
            <ul className="space-y-2">
              {guide.levels.map(({ level, when }) => (
                <li key={level} className="flex items-start gap-2">
                  <span className="w-16 shrink-0">
                    <AssessmentBadge level={level} />
                  </span>
                  <span className="text-background/70">{when}</span>
                </li>
              ))}
            </ul>
          )}
          {guide.note && <p className="text-background/70">{guide.note}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/** Evidence with the phrases that carry its verdict set in medium black over the grey. */
function Highlighted({ text, highlights = [] }: { text: string; highlights?: string[] }) {
  const runs: { at: number; text: string; strong: boolean }[] = [];
  let at = 0;
  while (at < text.length) {
    const hits = highlights
      .map((h) => ({ h, i: text.indexOf(h, at) }))
      .filter((x) => x.i >= 0)
      .sort((a, b) => a.i - b.i);
    const next = hits[0];
    if (!next) {
      runs.push({ at, text: text.slice(at), strong: false });
      break;
    }
    if (next.i > at) runs.push({ at, text: text.slice(at, next.i), strong: false });
    runs.push({ at: next.i, text: next.h, strong: true });
    at = next.i + next.h.length;
  }
  return (
    <>
      {runs.map((r) =>
        r.strong ? (
          <span key={r.at} className="font-medium text-foreground">
            {r.text}
          </span>
        ) : (
          <span key={r.at}>{r.text}</span>
        ),
      )}
    </>
  );
}

/** One fact: its name with the assessment floated opposite, then the evidence wrapping around it. */
function FactorRow({ row }: { row: FactorRowData }) {
  return (
    <div className="text-sm">
      <span className="float-right mb-3 ml-3">
        <AssessmentBadge level={row.level} label={row.assessment} />
      </span>
      <div className="font-medium text-foreground">
        {row.factor}
        {row.guide && <FactorGuideTip label={`How ${row.factor} is assessed`} guide={row.guide} />}
      </div>
      {row.body ?? (
        <p className="mt-1.5 font-normal text-muted-foreground">
          <Highlighted text={row.detail} highlights={row.highlights} />
        </p>
      )}
    </div>
  );
}

/** A factor's evidence table: the registry Table in a bordered card, cleared below the floated badge. */
function FactorTable({ children }: { children: ReactNode }) {
  return (
    <div className="relative clear-both mt-2">
      <Card className="max-h-[460px] gap-0 overflow-y-auto overflow-x-hidden py-0">
        <Table className="table-fixed [&_th]:top-0 [&_th]:bg-card [&_th]:shadow-[inset_0_-1px_0_var(--border)]">
          {children}
        </Table>
      </Card>
    </div>
  );
}

function SymbolLinks({ symbols }: { symbols: string[] }) {
  return symbols.map((symbol, i) => (
    <span key={symbol}>
      {i > 0 && ', '}
      <AssetLink symbol={symbol} />
    </span>
  ));
}

function OracleTypesTable() {
  return (
    <FactorTable>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30%]">Oracle type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[15%]">Weight</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-foreground">
        {ORACLE_TYPES.map((r) => (
          <TableRow key={r.key} className="align-top">
            <TableCell className="whitespace-normal align-top">{r.type}</TableCell>
            <TableCell className="whitespace-normal align-top">{r.description}</TableCell>
            <TableCell className="align-top tabular-nums">{r.weight}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </FactorTable>
  );
}

function CorrelationTable() {
  return (
    <FactorTable>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[28%]">Correlated price</TableHead>
          <TableHead>Collateral</TableHead>
          <TableHead className="w-[15%]">Of vault</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="text-foreground">
        {CORRELATION.map((r) => (
          <TableRow key={r.key} className="align-top">
            <TableCell className="whitespace-normal align-top">{r.price}</TableCell>
            <TableCell className="whitespace-normal align-top">
              <span className="flex items-center gap-2">
                <TokenStack tokens={r.symbols} size="md" />
                <span>
                  <SymbolLinks symbols={r.symbols} />
                  {r.note && <span className="text-muted-foreground"> ({r.note})</span>}
                </span>
              </span>
            </TableCell>
            <TableCell className="align-top tabular-nums">{r.pct}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </FactorTable>
  );
}

function ExposureTable({
  heading,
  shareHeading,
  rows,
  note,
}: {
  heading: string;
  shareHeading: string;
  rows: { key: string; label: string; sublabel?: string; symbols: string[]; pct: string }[];
  note?: string;
}) {
  return (
    <>
      <FactorTable>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[34%]">{heading}</TableHead>
            <TableHead>Collateral</TableHead>
            <TableHead className="w-[18%]">{shareHeading}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-foreground">
          {rows.map((r) => (
            <TableRow key={r.key} className="align-top">
              <TableCell className="whitespace-normal align-top">
                {r.label}
                {r.sublabel && <span className="text-muted-foreground"> · {r.sublabel}</span>}
              </TableCell>
              <TableCell className="whitespace-normal align-top">
                <span className="flex items-center gap-2">
                  <TokenStack tokens={r.symbols} size="md" />
                  <span>
                    <SymbolLinks symbols={r.symbols} />
                  </span>
                </span>
              </TableCell>
              <TableCell className="align-top tabular-nums">{r.pct}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </FactorTable>
      {note && <p className="mt-1.5 text-muted-foreground text-xs">{note}</p>}
    </>
  );
}

/** Vault risk: one TrayCard per group, the Counterparty card across both columns. */
function VaultRisks() {
  return (
    <div className="grid grid-flow-row-dense grid-cols-1 gap-4 lg:grid-cols-2">
      {VAULT_GROUPS.map((g) => (
        <TrayCard key={g.title} title={g.title} className={g.wide ? 'lg:col-span-2' : undefined}>
          {g.wide ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {g.rows.map((r) => (
                <FactorRow key={r.key} row={r} />
              ))}
            </div>
          ) : (
            g.rows.map((r) => <FactorRow key={r.key} row={r} />)
          )}
        </TrayCard>
      ))}
    </div>
  );
}

/** A reading: the short verdict, its level as a chip, the full sentence on hover. */
function ReadingCell({ cell }: { cell: Reading | null }) {
  if (!cell) return <span className="text-muted-foreground">Not assessed</span>;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex flex-wrap items-center gap-1.5 text-foreground outline-none">
            <span>{cell.label}</span>
            <AssessmentBadge level={cell.level} />
          </span>
        }
      />
      <TooltipContent side="top" sideOffset={6} className="max-w-sm text-wrap px-3.5 py-3 text-left">
        {cell.detail}
      </TooltipContent>
    </Tooltip>
  );
}

function GuidedHead({ title, label, guide }: { title: string; label: string; guide: Guide }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {title}
      <FactorGuideTip label={label} guide={guide} className="" />
    </span>
  );
}

const pctLabel = (fraction: number) => {
  const r = Math.round(fraction * 1000) / 10;
  return `${Number.isInteger(r) ? r : r.toFixed(1)}%`;
};

function PositionName({ row, withSkipped = false }: { row: Position; withSkipped?: boolean }) {
  const rest = [
    `${pctLabel(row.pct / 100)} of vault`,
    withSkipped && row.skipped > 0 ? `${row.skipped} under 1% not assessed` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className="flex min-w-0 items-center gap-2" title={`${row.name} · ${rest}`}>
      <TokenStack tokens={row.tokens} size="md" />
      <span className="min-w-0 truncate whitespace-nowrap">
        <span className="font-medium text-foreground">{row.name}</span>
        <span className="text-muted-foreground"> · {rest}</span>
      </span>
    </div>
  );
}

function CollateralCells({ c }: { c: Collateral }) {
  return (
    <>
      <TableCell className="whitespace-normal align-top">
        {c.type ? (
          <span className="text-foreground">{c.type}</span>
        ) : (
          <span className="text-muted-foreground">Not classified</span>
        )}
      </TableCell>
      <TableCell className="whitespace-normal align-top">
        {c.lltv != null ? (
          <span className="text-foreground tabular-nums">{pctLabel(c.lltv)}</span>
        ) : (
          <span className="text-muted-foreground">Not recorded</span>
        )}
      </TableCell>
      <TableCell className="whitespace-normal align-top">
        <ReadingCell cell={c.oracle} />
      </TableCell>
      <TableCell className="whitespace-normal align-top">
        <ReadingCell cell={c.backing} />
      </TableCell>
      <TableCell className="whitespace-normal align-top">
        <ReadingCell cell={c.liquidation} />
      </TableCell>
    </>
  );
}

/** Holdings risk: one line per position, a pool opening onto a line per material collateral. */
function PositionRisks() {
  return (
    <div>
      <Card className="gap-0 overflow-clip py-0">
        <Table className="table-fixed [&_th]:bg-card [&_th]:shadow-[inset_0_-1px_0_var(--border)]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Position</TableHead>
              <TableHead className="w-[11%]">Collateral type</TableHead>
              <TableHead className="w-[8%]">
                <GuidedHead title="LLTV" label="What the LLTV is" guide={GUIDES.lltv} />
              </TableHead>
              <TableHead className="w-[20%]">
                <GuidedHead title="Oracle" label="How the oracle is assessed" guide={GUIDES.oracle} />
              </TableHead>
              <TableHead className="w-[17%]">
                <GuidedHead title="Collateral backing" label="How the backing is assessed" guide={GUIDES.backing} />
              </TableHead>
              <TableHead className="w-[19%]">
                <GuidedHead
                  title="Liquidation probability over 30d"
                  label="How the liquidation probability is estimated"
                  guide={GUIDES.liquidation}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POSITIONS.flatMap((row) => {
              const [only] = row.collaterals;
              if (row.collaterals.length > 1) {
                return [
                  <TableRow key={row.key} className="align-top">
                    <TableCell className="whitespace-normal align-top">
                      <PositionName row={row} />
                    </TableCell>
                    <TableCell colSpan={5} className="whitespace-normal align-top text-muted-foreground">
                      {row.collaterals.length} collaterals assessed
                      {row.skipped > 0 && ` · ${row.skipped} under 1% not assessed`}
                    </TableCell>
                  </TableRow>,
                  ...row.collaterals.map((c, i) => (
                    <TableRow key={`${row.key}-${c.key}`} className="border-0 bg-muted/30 align-top">
                      <TableCell className="relative whitespace-normal pl-10 align-top">
                        <TreeElbow depth={1} isLast={i === row.collaterals.length - 1} />
                        <div className="flex min-w-0 items-center gap-2 text-foreground">
                          <TokenStack tokens={[c.symbol]} size="md" />
                          <span className="truncate">
                            <AssetLink symbol={c.symbol} />
                            {c.share != null && <span className="text-muted-foreground"> · {pctLabel(c.share)}</span>}
                          </span>
                        </div>
                      </TableCell>
                      <CollateralCells c={c} />
                    </TableRow>
                  )),
                ];
              }
              return [
                <TableRow key={row.key} className="align-top">
                  <TableCell className="whitespace-normal align-top">
                    <PositionName row={row} withSkipped />
                  </TableCell>
                  {only ? (
                    <CollateralCells c={only} />
                  ) : (
                    <TableCell colSpan={5} className="whitespace-normal align-top text-muted-foreground">
                      {row.note}
                    </TableCell>
                  )}
                </TableRow>,
              ];
            })}
          </TableBody>
        </Table>
      </Card>
      <div className="mt-3 text-muted-foreground text-sm">{POSITIONS.length} positions</div>
    </div>
  );
}

/** A risk section's heading and standfirst over its cards; on the vault page it scrolls with the section. */
function StickyRiskSection({
  title,
  intro,
  first = false,
  pinned = false,
  children,
}: {
  title: string;
  intro: ReactNode;
  first?: boolean;
  pinned?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cn('relative flex flex-col', !first && 'pt-10')}>
      <div className={cn('pt-2 pb-3', pinned && '-mx-2 bg-background/80 px-2 backdrop-blur-md')}>
        <h2 className="font-medium text-foreground text-lg">{title}</h2>
        <p className="mt-1 font-normal text-muted-foreground text-sm">{intro}</p>
      </div>
      <div aria-hidden className="h-4" />
      {children}
    </section>
  );
}

function RiskTab() {
  return (
    <div className="flex flex-col">
      <StickyRiskSection
        first
        title="Vault risk"
        intro={
          <>
            <span className="block">
              The vault as a whole: how it is structured and governed, how concentrated and correlated the book is,
            </span>
            <span className="block">
              how it exits, who it depends on, and how its funded markets price their collateral and leave room before
              liquidation.
            </span>
          </>
        }
      >
        <VaultRisks />
      </StickyRiskSection>
      <StickyRiskSection
        title="Holdings risk"
        intro={
          <>
            <span className="block">
              Each funded position's liquidation LTV, how its collateral is priced, what backs that collateral, and the
              chance a 30-day period liquidates more than 10% of the market's debt.
            </span>
            <span className="block">
              Only collaterals making up 1% or more of a position's collateral are assessed.
            </span>
          </>
        }
      >
        <PositionRisks />
      </StickyRiskSection>
    </div>
  );
}

/** The asset page's Risk assessment: one card per layer, the folding grid shown at rest. */
function RiskGroupCards({ folded = [] }: { folded?: string[] }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      {ASSET_GROUPS.map((g) => (
        <TrayCard key={g.title} title={g.title} band={folded.includes(g.title)}>
          {g.rows.map((r) => (
            <FactorRow key={r.key} row={r} />
          ))}
        </TrayCard>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------

/** An address with a copy button that slides in on hover. */
function AddressValue({ display, full }: { display: string; full: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard denied: the title attribute still carries the full address.
    }
  };
  return (
    <span className="group relative inline-flex items-center">
      <span
        className="font-medium text-foreground text-sm transition-transform duration-150 ease-out group-focus-within:-translate-x-6 group-hover:-translate-x-6 motion-reduce:transition-none"
        title={full}
      >
        {display}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={copy}
        aria-label={copied ? 'Address copied' : 'Copy address'}
        className="absolute -right-1 size-auto text-muted-foreground opacity-0 transition-opacity duration-150 ease-out hover:bg-transparent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none dark:hover:bg-transparent"
      >
        <Icon icon={copied ? Tick02Icon : Copy01Icon} />
      </Button>
    </span>
  );
}

function RolesExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger className="inline-flex items-center gap-1.5 font-normal text-muted-foreground text-sm hover:text-foreground">
        <Icon
          icon={ArrowDown01Icon}
          className={cn('transition-transform duration-150', open ? 'rotate-0' : '-rotate-90')}
        />
        What these roles can do
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2 py-4">
          <CardContent className="px-4">
            <p className="mb-3 text-muted-foreground text-sm">
              Every permission on a Railnet product is a role held in its access control contract. The admin grants and
              revokes them; each is granted protocol-wide or scoped to one contract, and some — deposits, redemptions —
              are opened to everyone.
            </p>
            <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <div key={r.name}>
                  <dt className="flex flex-wrap items-baseline gap-x-2 font-medium text-foreground text-sm">
                    {r.label}
                    <code className="font-normal text-muted-foreground text-xs">{r.name}</code>
                    {r.holders > 1 && (
                      <span className="font-normal text-muted-foreground text-xs">{r.holders} holders</span>
                    )}
                  </dt>
                  <dd className="text-muted-foreground text-sm">
                    {r.can ?? "Railnet's documentation does not describe this role yet."}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

function GovernanceTab() {
  return (
    <div>
      <h2 className="mb-3 font-medium text-foreground text-lg">Governance</h2>
      <Card className="py-4">
        <CardContent className="grid grid-cols-1 gap-x-10 gap-y-0 px-4 sm:grid-cols-2">
          {GOVERNANCE.map((f) => (
            <div key={f.full ?? f.label} className="flex items-baseline justify-between gap-3 py-1">
              <span className="inline-flex items-center gap-1 font-normal text-muted-foreground text-sm">
                {f.label}
                {f.help && (
                  <InfoHint label={f.label} size="size-3.5">
                    {f.help}
                  </InfoHint>
                )}
              </span>
              {f.full ? (
                <AddressValue display={f.value} full={f.full} />
              ) : (
                <span className="font-medium text-foreground text-sm">{f.value}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <RolesExplainer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Report — Railnet terms, Sources and the closing date line
// ---------------------------------------------------------------------------

const RAILNET_TERMS = {
  multivehicle:
    'A MultiVehicle is a Railnet product that spreads deposits across several Vehicles, each running one strategy, and rebalances between them.',
  vehicle: 'A Vehicle runs one strategy: it holds a position in a market or a vault on behalf of the product above it.',
  conduit: 'A Conduit is how a distributor offers a Railnet product to its own users, under its own terms.',
};

/** A Railnet word with its meaning on hover, dotted-underlined so it reads as "there is more here". */
function RailnetTerm({ term, children }: { term: keyof typeof RAILNET_TERMS; children: ReactNode }) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        closeDelay={60}
        render={
          <span className="cursor-help underline decoration-dotted underline-offset-2 outline-none focus-visible:text-foreground">
            {children}
          </span>
        }
      />
      <HoverCardContent align="start" className="w-80 font-normal text-foreground text-xs">
        {RAILNET_TERMS[term]}
      </HoverCardContent>
    </HoverCard>
  );
}

// ---------------------------------------------------------------------------
// Asset report
// ---------------------------------------------------------------------------

const ASSET = {
  symbol: 'sUSDe',
  name: 'Ethena Staked USDe',
  chains: ['Ethereum', 'Arbitrum', 'Base', 'Mantle', 'Blast'],
};

function AssetActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button size="sm" variant="outline" className="shrink-0 gap-2">
        See on map
        <Icon icon={CircleDotDashedIcon} />
      </Button>
    </div>
  );
}

/** The asset page's title block: identity, the PDF's tags, and the usage figures as stats. */
type Representation = { underlying: string; assessed: boolean };

/** A bridged representation (USDT0 of USDT) links to its underlying's report; a badge says where its risk is assessed. */
function RepresentationLink({ representation }: { representation: Representation }) {
  const u = representation.underlying;
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" className="inline-flex items-center gap-1.5 hover:underline">
        <Icon icon={Link01Icon} className="size-4" />
        Representation of {u}
      </button>
      {representation.assessed ? (
        <ProjectBadge variant="neutral">Assessed in {u}'s report</ProjectBadge>
      ) : (
        <ProjectBadge variant="warning">{u} not yet assessed</ProjectBadge>
      )}
    </span>
  );
}

function AssetDetailHeader({
  asset = ASSET,
  representation,
}: {
  asset?: { symbol: string; name: string | null; chains: string[] };
  representation?: Representation;
}) {
  const stack = asset.chains.slice(0, 4);
  return (
    <div className="bg-background">
      <div className="px-6 pt-4">
        <div className="pt-3 pb-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="flex items-center gap-3 text-3xl text-foreground text-stat">
              <Mark label={asset.symbol} className="data-[size=sm]:size-8" />
              {/* The symbol beside the name, unless the name only restates it. */}
              {asset.name && asset.name.toLowerCase() !== asset.symbol.toLowerCase() ? (
                <span>
                  {asset.name} <span className="text-muted-foreground">{asset.symbol}</span>
                </span>
              ) : (
                asset.symbol
              )}
            </h1>
            <AssetActions />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-foreground text-sm">
            {!representation && (
              <>
                <span>Synthetic dollar</span>
                <span className="inline-flex items-center gap-1.5">
                  <Logo label="Copper" />
                  Copper Custody
                </span>
                <span className="text-muted-foreground" title="LEI 213800ABCDEF12345678">
                  Custodian entity: Copper Technologies (UK)
                </span>
              </>
            )}
            <button
              type="button"
              title={asset.chains.join(', ')}
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <span className="inline-flex items-center">
                {stack.map((c, i) => (
                  <span
                    key={c}
                    style={{ zIndex: stack.length - i }}
                    className={cn('relative inline-flex rounded-full ring-1 ring-background', i > 0 && '-ml-2')}
                  >
                    <Logo label={c} />
                  </span>
                ))}
              </span>
              +{asset.chains.length - stack.length}
            </button>
            {!representation && <span>ERC-4626</span>}
            {representation ? (
              <RepresentationLink representation={representation} />
            ) : (
              <ProjectBadge variant="warning">Not yet assessed</ProjectBadge>
            )}
            {!representation && (
              <span className="text-muted-foreground">Issued by Ethena Labs · British Virgin Islands</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-x-[72px] gap-y-4 pt-4 pb-2">
          <Stat
            label="Collateral in"
            value="42"
            sub="markets on Morpho, Aave"
            hint={
              <p>
                Lending markets Railnet indexes (Aave, Aave V4, Morpho) on 5 chains that accept sUSDe as collateral. On
                Aave every reserve of a pool that accepts it counts.
              </p>
            }
          />
          <Stat label="Exposed via collateral" value="18" sub="vaults allocating into those markets" />
          <Stat
            label="Vaults depositing it"
            value="3"
            sub="$12.4M deposited"
            hint={
              <p>
                Vaults that take sUSDe as their deposit asset: users supply it to earn yield. This is the loan side, so
                it is not counted in the collateral figures beside it.
              </p>
            }
          />
          <Stat
            label="Lent against it"
            value="$1.21B"
            sub="plus $640.2M borrowed in pools that accept it"
            hint={
              <p>
                Isolated markets (Morpho) lend against this asset alone. A pool (Aave) that accepts it lends against all
                its collateral, so its borrows are shown separately as context.
              </p>
            }
          />
          <Stat label="Deployed" value="Feb 2024" sub="2 years in production" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The catalogue
// ---------------------------------------------------------------------------

/** A page-coloured frame, so a page-level block reads as it sits on the detail page. */
function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('overflow-hidden rounded-xl border bg-background', className)}>{children}</div>;
}

/** The vault and asset pages' own screens: header, overview, holdings, risk, governance. */
export function RiskVault() {
  return (
    <>
      <Page className="pb-4">
        <VaultDetailHeader />
      </Page>
      <OverviewTab />
      <HoldingsTab />
      <RailnetHoldingsRows />
      <RiskTab />
      <StickyRiskSection pinned first title="Risk assessment" intro="5 checks · 3 to review">
        <RiskGroupCards folded={['Institutional']} />
      </StickyRiskSection>
      <GovernanceTab />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Page className="pb-4">
          <AssetDetailHeader />
        </Page>
        <Page className="pb-4">
          <AssetDetailHeader
            asset={{ symbol: 'USDT0', name: 'USDT0', chains: ['Arbitrum', 'Ink', 'Unichain', 'Berachain', 'Sei'] }}
            representation={{ underlying: 'USDT', assessed: true }}
          />
        </Page>
      </div>
    </>
  );
}
