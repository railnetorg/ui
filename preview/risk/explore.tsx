import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown02Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  BankIcon,
  BoxesIcon,
  BubblesIcon,
  Coins01Icon,
  DropletIcon,
  Flag02Icon,
  HourglassIcon,
  Layers01Icon,
  Layout2ColumnIcon,
  LockIcon,
  MinusSignIcon,
  PackageIcon,
  PercentIcon,
  PlusSignIcon,
  ScanSearchIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LevelGlyph, type RiskCheck, type RiskLevel, VAULT_CHECKS } from '@preview/risk/shared';
import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Kbd } from '@/components/ui/kbd';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ── Mock data ────────────────────────────────────────────────────────────

type Protocol = 'morpho' | 'aave' | 'railnet';
type Icon = typeof PackageIcon;
type VaultType = 'Vault' | 'Market' | 'Asset' | 'Conduit' | 'MultiVehicle' | 'Strategy';

const PROTOCOL_NAME: Record<Protocol, string> = { morpho: 'Morpho', aave: 'Aave', railnet: 'Railnet' };
/** The 1px brand border, and the halo drawn at 20% around a protocol bubble. */
const PROTOCOL_BORDER: Record<Protocol, string> = { morpho: '#0168E1', aave: '#9391F7', railnet: '#500000' };
const PROTOCOL_RING: Record<Protocol, string> = { morpho: '#3B82F6', aave: '#8B5CF6', railnet: '#500000' };

const TYPE_LABEL: Record<VaultType, string> = {
  Vault: 'Vault',
  Market: 'Market',
  Asset: 'Asset',
  Conduit: 'Vault',
  MultiVehicle: 'Multi-strategy vault',
  Strategy: 'Strategy',
};
const TYPE_ICON: Record<VaultType, Icon> = {
  Vault: PackageIcon,
  Market: ArrowDataTransferHorizontalIcon,
  Asset: Coins01Icon,
  Conduit: Layers01Icon,
  MultiVehicle: BoxesIcon,
  Strategy: PackageIcon,
};

/** Brand colours the logo stand-ins are drawn in. */
const BRAND: Record<string, string> = {
  Morpho: '#0168E1',
  Aave: '#9391F7',
  Railnet: '#500000',
  Euler: '#0D1421',
  Upshift: '#00F29B',
  Veda: '#7270FF',
  Ethereum: '#627EEA',
  Base: '#0052FF',
  Arbitrum: '#28A0F0',
  USDC: '#2775CA',
  USDT: '#26A17B',
  PYUSD: '#0070E0',
  WETH: '#627EEA',
  wstETH: '#00A3FF',
  weETH: '#5948D9',
  cbBTC: '#0052FF',
  WBTC: '#F09242',
  sUSDe: '#111111',
  'PT-sUSDe': '#3A3A3A',
  Steakhouse: '#B4302A',
  Gauntlet: '#1F2937',
  CoinShares: '#E3672A',
};

const fmtUsd = (n: number) =>
  n >= 1e9
    ? `$${(n / 1e9).toFixed(2)}B`
    : n >= 1e6
      ? `$${(n / 1e6).toFixed(1)}M`
      : n >= 1e3
        ? `$${(n / 1e3).toFixed(1)}K`
        : `$${n.toFixed(0)}`;
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;

type Holding = { kind: 'market' | 'vault' | 'asset'; label: string; pct: number; usd: number; collaterals: string[] };

function holdingsFor(tvl: number, list: [Holding['kind'], string, number, string[]][]): Holding[] {
  return list.map(([kind, label, pct, collaterals]) => ({ kind, label, pct, usd: (tvl * pct) / 100, collaterals }));
}

type ExploreRow = {
  id: string;
  name: string;
  type: VaultType;
  asset: string;
  protocol: Protocol;
  curator: string | null;
  /** An Aave reserve's "curator" is its market name, shown with the Aave mark. */
  aaveReserve?: boolean;
  chain: string;
  apy: number | null;
  apyWindow: string;
  tvl: number;
  composition: string;
  checks: RiskCheck[];
  conduits: { address: string; name: string; tvl: number; apy: number }[];
  via?: { name: string; sharedWith: string[] };
  liquidity: number;
  summary: string;
  holdings: Holding[];
};

const STEAKHOUSE_HOLDINGS: [Holding['kind'], string, number, string[]][] = [
  ['market', 'cbBTC/USDC 86%', 41.2, ['cbBTC']],
  ['market', 'wstETH/USDC 86%', 22.6, ['wstETH']],
  ['market', 'WBTC/USDC 86%', 14.1, ['WBTC']],
  ['vault', 'Gauntlet USDC Core', 9.8, ['cbBTC', 'WBTC', 'wstETH', 'weETH', 'sUSDe']],
  ['market', 'sUSDe/USDC 91.5%', 5.3, ['sUSDe']],
  ['market', 'PT-sUSDe/USDC 91.5%', 3.1, ['PT-sUSDe']],
  ['market', 'weETH/USDC 86%', 2.4, ['weETH']],
  ['asset', 'USDC (idle)', 1.5, []],
];

const ROWS: ExploreRow[] = [
  {
    id: 'steakhouse-usdc',
    name: 'Steakhouse USDC',
    type: 'Vault',
    asset: 'USDC',
    protocol: 'morpho',
    curator: 'Steakhouse',
    chain: 'Ethereum',
    apy: 0.0584,
    apyWindow: '7d',
    tvl: 412.8e6,
    composition: '12 markets',
    checks: VAULT_CHECKS,
    conduits: [],
    liquidity: 61.9e6,
    summary: 'A blue-chip USDC book, but 41% of it sits in one cbBTC market running hot.',
    holdings: holdingsFor(412.8e6, STEAKHOUSE_HOLDINGS),
  },
  {
    id: 'gauntlet-weth',
    name: 'Gauntlet WETH Prime',
    type: 'Vault',
    asset: 'WETH',
    protocol: 'morpho',
    curator: 'Gauntlet',
    chain: 'Base',
    apy: 0.0291,
    apyWindow: '7d',
    tvl: 186.2e6,
    composition: '6 markets',
    checks: VAULT_CHECKS.slice(0, 4),
    conduits: [],
    liquidity: 48.4e6,
    summary: 'Liquid-staking collateral only, with a 3-day timelock on every change.',
    holdings: holdingsFor(186.2e6, [
      ['market', 'wstETH/WETH 94.5%', 52.4, ['wstETH']],
      ['market', 'weETH/WETH 94.5%', 31.0, ['weETH']],
      ['market', 'cbBTC/WETH 86%', 12.2, ['cbBTC']],
      ['asset', 'WETH (idle)', 4.4, []],
    ]),
  },
  {
    id: 'aave-usdt',
    name: 'Aave v3 USDT',
    type: 'Market',
    asset: 'USDT',
    protocol: 'aave',
    curator: 'AaveV3Ethereum',
    aaveReserve: true,
    chain: 'Ethereum',
    apy: 0.0412,
    apyWindow: 'now',
    tvl: 1.21e9,
    composition: '18 collaterals',
    checks: VAULT_CHECKS.slice(0, 3),
    conduits: [],
    liquidity: 202.5e6,
    summary: 'The pool reserve: deep exit liquidity, governed by Aave itself.',
    holdings: holdingsFor(1.21e9, [['asset', 'USDT reserve', 100, ['WETH', 'wstETH', 'WBTC', 'cbBTC', 'weETH']]]),
  },
  {
    id: 'coinshares',
    name: 'CoinShares DeFi Income',
    type: 'Conduit',
    asset: 'USDC',
    protocol: 'railnet',
    curator: 'CoinShares',
    chain: 'Ethereum',
    apy: 0.0489,
    apyWindow: '30d',
    tvl: 10.4e6,
    composition: '5 positions',
    checks: VAULT_CHECKS,
    conduits: [],
    via: { name: 'Railnet USDC Core', sharedWith: ['Safe Treasury USDC'] },
    liquidity: 2.1e6,
    summary: 'Distributes Railnet USDC Core, which lends into Morpho markets and the Aave pool.',
    holdings: holdingsFor(10.4e6, [
      ['vault', 'Steakhouse USDC', 44, ['cbBTC', 'wstETH', 'WBTC']],
      ['market', 'Aave v3 USDC', 31, ['WETH', 'wstETH', 'WBTC', 'cbBTC']],
      ['market', 'cbBTC/USDC 86%', 15, ['cbBTC']],
      ['asset', 'USDC (idle)', 10, []],
    ]),
  },
  {
    id: 'railnet-core',
    name: 'Railnet USDC Core',
    type: 'MultiVehicle',
    asset: 'USDC',
    protocol: 'railnet',
    curator: 'Steakhouse',
    chain: 'Ethereum',
    apy: 0.0502,
    apyWindow: '30d',
    tvl: 16.6e6,
    composition: '5 positions',
    checks: VAULT_CHECKS.slice(1),
    conduits: [
      { address: '0xc01n', name: 'CoinShares DeFi Income', tvl: 10.4e6, apy: 0.0489 },
      { address: '0x5afe', name: 'Safe Treasury USDC', tvl: 6.2e6, apy: 0.0495 },
    ],
    liquidity: 3.4e6,
    summary: 'Splits USDC across four Morpho markets and the Aave pool.',
    holdings: holdingsFor(16.6e6, [
      ['vault', 'Steakhouse USDC', 44, ['cbBTC', 'wstETH', 'WBTC']],
      ['market', 'Aave v3 USDC', 31, ['WETH', 'wstETH']],
      ['asset', 'USDC (idle)', 25, []],
    ]),
  },
  {
    id: 're7-cbbtc',
    name: 'Re7 cbBTC',
    type: 'Vault',
    asset: 'cbBTC',
    protocol: 'morpho',
    curator: 'Re7 Labs',
    chain: 'Base',
    apy: 0.0118,
    apyWindow: '7d',
    tvl: 64.5e6,
    composition: '3 markets',
    checks: [...VAULT_CHECKS.slice(0, 2), { ...VAULT_CHECKS[4], level: 'high' } as RiskCheck],
    conduits: [],
    liquidity: 5.2e6,
    summary: 'Lends cbBTC against stablecoins; one market sits at 94% utilisation.',
    holdings: holdingsFor(64.5e6, [
      ['market', 'USDC/cbBTC 77%', 61, ['USDC']],
      ['market', 'sUSDe/cbBTC 77%', 30, ['sUSDe']],
      ['asset', 'cbBTC (idle)', 9, []],
    ]),
  },
];

const rowById = (id: string) => ROWS.find((r) => r.id === id) ?? (ROWS[0] as ExploreRow);

/** The SVG arrowhead every cord and the legend draw, tip at the origin, pointing along +x. */
const ARROW_PATH = 'M 0 0 L -9 4.5 L -9 -4.5 Z';
const MORPHO_BLUE = '#0168E1';

/** The canvas the map sits on: a 17px dotted grid, as the explore shell paints it. */
const DOTS: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, var(--gray-100) 1px, transparent 1.5px)',
  backgroundSize: '17px 17px',
};

// ── Logos (logos.tsx) ────────────────────────────────────────────────────

/**
 * Every logo is the registry Avatar at 20px, as in the app: the image when it loads, else the initial on a
 * muted circle. No images ship here, so a known brand's colour fills the circle in place of its image.
 */
function Disc({
  label,
  color,
  className,
  style,
}: {
  label: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Avatar className={cn('size-5', className)}>
      <AvatarFallback
        className={cn('font-semibold text-[10px] group-data-[size=sm]/avatar:text-[10px]', color && 'text-white')}
        style={color ? { backgroundColor: color } : style}
      >
        {label.trim().charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function TokenLogo({ symbol, className }: { symbol: string; className?: string }) {
  return <Disc label={symbol} color={BRAND[symbol]} className={className} />;
}

function ChainLogo({ label, className }: { label: string; className?: string }) {
  return <Disc label={label} color={BRAND[label]} className={className} />;
}

function ProtocolLogo({ protocol, className }: { protocol: string; className?: string }) {
  return <Disc label={protocol} color={BRAND[protocol]} className={className} />;
}

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

/** A known curator's mark, else a soft initials chip whose hue is hashed from the name. */
function CuratorAvatar({ name, className }: { name: string; className?: string }) {
  if (BRAND[name]) return <Disc label={name} color={BRAND[name]} className={className} />;
  const hue = hashHue(name);
  return (
    <Disc
      label={name}
      className={className}
      style={{ backgroundColor: `hsl(${hue} 85% 90%)`, color: `hsl(${hue} 55% 32%)` }}
    />
  );
}

/** The venues a cord runs through, overlapped in its tag. */
function VenueMarks({ venues }: { venues: string[] }) {
  return (
    <span className="inline-flex shrink-0 items-center">
      {venues.map((v, i) => (
        <span key={v} className={i > 0 ? '-ml-1 inline-flex rounded-full ring-1 ring-background' : 'inline-flex'}>
          <ProtocolLogo protocol={v} className="size-3 text-[7px]" />
        </span>
      ))}
    </span>
  );
}

// ── Filters (filter-bar.tsx, filter-strip.tsx, filter-toolbar.tsx) ─────

// ── Start screen (explore-start-state.tsx and its bubbles) ──────────────

/** Radius of the drawn circle and its centre's y, in the 225×227 drawing box. */
const R = 88;
const CY = 90;
/** Centre to centre, under the sum of radii, so neighbours overlap at the rims. */
const SPACING = 150;
/** Drawing units to pixels: the app draws the frame min(720px, 78vh) wide; the preview a fixed 0.85. */
const px = (units: number) => `${(units * 0.85).toFixed(2)}px`;

/** Out-of-phase floats, so neighbouring bubbles never bob in unison. */
const MOTION = [
  { duration: '7s', delay: '-1.4s', rise: '-10px' },
  { duration: '6.5s', delay: '-4.6s', rise: '-11px' },
  { duration: '6s', delay: '-3.1s', rise: '-13px' },
] as const;

const levitate = (m: { duration: string; delay: string; rise: string }): CSSProperties =>
  ({
    animation: `risk-levitate ${m.duration} ease-in-out infinite`,
    animationDelay: m.delay,
    '--levitate-rise': m.rise,
  }) as CSSProperties;

const LIFT =
  'transition-transform duration-200 ease-out group-hover:scale-[1.04] group-has-[:focus-visible]:scale-[1.04]';

/**
 * A bubble in the start screen's drawing, for any brand: a disc with a brand stroke and its 12%
 * halo, a drop shadow tinted with the stroke, the mark over the name, and an optional badge.
 */
function BrandBubble({
  className,
  color,
  label,
  sublabel,
  badge,
}: {
  className?: string;
  color: string;
  label: string;
  sublabel?: string;
  badge?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [r, g, b] = [1, 3, 5].map((i) => (Number.parseInt(color.slice(i, i + 2), 16) / 255).toFixed(6));
  const lift = (badge ? 9 : 0) + (sublabel ? 8 : 0);
  const font = { fontFamily: '"Inter Tight", system-ui, sans-serif', letterSpacing: 0 };
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 225 227" fill="none" className="block w-full" aria-hidden>
        <defs>
          <filter
            id={`${id}-shadow`}
            x="0"
            y="0"
            width="225"
            height="227"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="10" dy="24" />
            <feGaussianBlur stdDeviation="11.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 0.1 0`} />
            <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
          </filter>
        </defs>
        <g filter={`url(#${id}-shadow)`}>
          <circle cx="102.5" cy="90" r="86" fill="var(--background)" />
          <circle cx="102.5" cy="90" r="85.5" stroke={color} />
          <circle cx="102.5" cy="90" r="88" stroke={color} strokeOpacity="0.12" strokeWidth="4" />
          <circle cx="102.5" cy={78 - lift} r="16" fill={color} />
          <text
            x="102.5"
            y={83 - lift}
            textAnchor="middle"
            fill="#fff"
            style={{ ...font, fontSize: '14px', fontWeight: 600 }}
          >
            {label.charAt(0).toUpperCase()}
          </text>
          <text
            x="102.5"
            y={113 - lift}
            textAnchor="middle"
            fill="var(--foreground)"
            style={{ ...font, fontSize: label.length > 18 ? '12px' : '14px', fontWeight: 500 }}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x="102.5"
              y={129 - lift}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              style={{ ...font, fontSize: '12px', fontWeight: 400 }}
            >
              {sublabel}
            </text>
          )}
        </g>
      </svg>
      {badge && (
        <Badge
          variant="outline"
          className="absolute -translate-x-1/2 -translate-y-1/2 bg-background"
          style={{ left: `${(102.5 / 225) * 100}%`, top: `${((sublabel ? 131 : 123) / 227) * 100}%` }}
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}

/** The circular hit area over a bubble's disc: the box around it is mostly drop shadow. */
function DiscButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      className="pointer-events-auto absolute cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        left: `${((102.5 - R) / 225) * 100}%`,
        top: `${((CY - R) / 227) * 100}%`,
        width: `${((2 * R) / 225) * 100}%`,
        height: `${((2 * R) / 227) * 100}%`,
      }}
    />
  );
}

/** A bubble: live when it names a protocol the platform covers, otherwise a greyed "Coming soon". */
type StartEntry = { label: string; protocol?: Protocol; color: string };
const INFRASTRUCTURE: StartEntry[] = [
  { label: 'Upshift', color: '#00F29B' },
  { label: 'Railnet', protocol: 'railnet', color: PROTOCOL_BORDER.railnet },
  { label: 'Veda', color: '#7270FF' },
];
const PROTOCOLS: StartEntry[] = [
  { label: 'Aave', protocol: 'aave', color: PROTOCOL_BORDER.aave },
  { label: 'Morpho', protocol: 'morpho', color: PROTOCOL_BORDER.morpho },
  { label: 'Euler', color: '#0D1421' },
];

/** One group's bubbles in a row, circles SPACING apart, the middle one drawn on top. */
function StartBubbleRow({ entries, onPick }: { entries: StartEntry[]; onPick: (p: Protocol) => void }) {
  const middle = Math.floor(entries.length / 2);
  return (
    <div
      className="flex items-start justify-center"
      style={{ transform: `translateX(${px((225 - 205) / 2)})`, marginBottom: px(-(227 - (CY + R))) }}
    >
      {entries.map((entry, i) => {
        const motion = MOTION[i % MOTION.length] ?? MOTION[0];
        const { protocol } = entry;
        return (
          <div
            key={entry.label}
            className={cn(
              'group pointer-events-none relative shrink-0',
              i === middle && 'z-10',
              !protocol && 'opacity-50',
            )}
            style={{ width: px(225), marginLeft: i > 0 ? px(SPACING - 225) : undefined, ...levitate(motion) }}
            {...(protocol ? {} : { role: 'img', 'aria-label': `${entry.label}, coming soon` })}
          >
            <BrandBubble
              className={cn('pointer-events-none block w-full', protocol && LIFT)}
              color={entry.color}
              label={entry.label}
              badge={protocol ? undefined : 'Coming soon'}
            />
            {protocol && <DiscButton label={entry.label} onClick={() => onPick(protocol)} />}
          </div>
        );
      })}
    </div>
  );
}

type AssetManager = { name: string; tvl: number; vaults: number; onRailnet: boolean };
const MANAGERS: AssetManager[] = [
  { name: 'Gauntlet', tvl: 1.42e9, vaults: 38, onRailnet: false },
  { name: 'Steakhouse', tvl: 984e6, vaults: 24, onRailnet: true },
  { name: 'CoinShares', tvl: 10.4e6, vaults: 1, onRailnet: true },
  { name: 'Re7 Labs', tvl: 512e6, vaults: 21, onRailnet: false },
  { name: 'MEV Capital', tvl: 341e6, vaults: 17, onRailnet: false },
  { name: 'Block Analitica', tvl: 128e6, vaults: 9, onRailnet: false },
  { name: 'K3 Capital', tvl: 61e6, vaults: 4, onRailnet: false },
];

/** Carousel slots either side of the middle: smaller and fainter, the last one off stage. */
const SLOTS = [
  { x: 0, scale: 1, opacity: 1 },
  { x: 141, scale: 0.85, opacity: 1 },
  { x: 259, scale: 0.7, opacity: 0.55 },
  { x: 330, scale: 0.35, opacity: 0 },
] as const;
const ARROW_X = 362;
const ASSET_MANAGER_VIEW_H = px(CY + R);

/** The "By asset manager" tab: a five-up carousel opening on Railnet's managers, in Railnet's colour. */
function AssetManagerBubbles({ onPick }: { onPick: (name: string) => void }) {
  const railnet = MANAGERS.filter((m) => m.onRailnet);
  const rest = MANAGERS.filter((m) => !m.onRailnet);
  const list = rest[0] ? [rest[0], ...railnet, ...rest.slice(1)] : railnet;
  const [center, setCenter] = useState(Math.min(list.length - 1, railnet.length));
  return (
    <div className="relative w-full" style={{ height: ASSET_MANAGER_VIEW_H }}>
      {list.map((m, i) => {
        const offset = i - center;
        const slot = SLOTS[Math.abs(offset)];
        if (!slot) return null;
        const visible = slot.opacity > 0;
        return (
          <div
            key={m.name}
            className="pointer-events-none absolute top-0 left-1/2 [transition:transform_650ms_cubic-bezier(0.22,1,0.36,1),opacity_650ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              width: px(225),
              transform: `translateX(${px(Math.sign(offset) * slot.x - 102.5)}) scale(${slot.scale})`,
              transformOrigin: `${(102.5 / 225) * 100}% ${(CY / 227) * 100}%`,
              opacity: slot.opacity,
              zIndex: 10 - Math.abs(offset) * 2,
            }}
            aria-hidden={!visible}
          >
            <div style={levitate(MOTION[i % MOTION.length] ?? MOTION[0])}>
              <div className="group relative">
                <BrandBubble
                  className={cn('pointer-events-none block w-full', LIFT)}
                  color={m.onRailnet ? PROTOCOL_BORDER.railnet : '#6B7280'}
                  label={m.name}
                  sublabel={fmtUsd(m.tvl)}
                  badge={m.onRailnet ? 'Live on Railnet' : `${m.vaults} vault${m.vaults === 1 ? '' : 's'}`}
                />
                {visible && <DiscButton label={m.name} onClick={() => onPick(m.name)} />}
              </div>
            </div>
          </div>
        );
      })}
      {(
        [
          { dir: -1, label: 'Previous asset manager', icon: ArrowLeft01Icon, disabled: center === 0 },
          { dir: 1, label: 'Next asset manager', icon: ArrowRight01Icon, disabled: center >= list.length - 1 },
        ] as const
      ).map(({ dir, label, icon, disabled }) => (
        <Button
          key={dir}
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={() => setCenter((c) => Math.max(0, Math.min(list.length - 1, c + dir)))}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
          style={{ left: `calc(50% + ${px(dir * ARROW_X)})`, top: px(CY) }}
        >
          <HugeiconsIcon icon={icon} />
        </Button>
      ))}
    </div>
  );
}

/** A blurred field in the protocol colours behind the start gate, cleared in the middle. */
const FIELD: { x: number; y: number; r: number; p: Protocol; o: number }[] = [
  { x: 8, y: 12, r: 130, p: 'morpho', o: 0.44 },
  { x: 22, y: 30, r: 74, p: 'aave', o: 0.39 },
  { x: 16, y: 74, r: 118, p: 'aave', o: 0.43 },
  { x: 30, y: 90, r: 66, p: 'morpho', o: 0.33 },
  { x: 2, y: 88, r: 84, p: 'morpho', o: 0.29 },
  { x: 50, y: 2, r: 62, p: 'aave', o: 0.32 },
  { x: 64, y: 10, r: 108, p: 'morpho', o: 0.43 },
  { x: 92, y: 14, r: 124, p: 'aave', o: 0.44 },
  { x: 96, y: 48, r: 70, p: 'morpho', o: 0.36 },
  { x: 84, y: 68, r: 112, p: 'morpho', o: 0.41 },
  { x: 70, y: 86, r: 80, p: 'aave', o: 0.36 },
  { x: 44, y: 42, r: 46, p: 'aave', o: 0.2 },
  { x: 58, y: 58, r: 52, p: 'morpho', o: 0.2 },
];
const CLEARING = 'radial-gradient(ellipse 62% 72% at 50% 50%, transparent 0 58%, #000 100%)';

function AmbientBubbles() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: CLEARING, WebkitMaskImage: CLEARING }}
    >
      {FIELD.map((b) => (
        <span
          key={`${b.x}-${b.y}`}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.r * 2,
            height: b.r * 2,
            backgroundColor: PROTOCOL_BORDER[b.p],
            opacity: b.o,
            filter: `blur(${Math.round(b.r * 0.75)}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

/** What the bubble view shows before anything is chosen: the copy, then three tabs of bubbles. */
function ExploreStartState() {
  const [picked, setPicked] = useState<string | null>(null);
  const pickProtocol = (p: Protocol) =>
    setPicked(`${p === 'railnet' ? 'Infrastructure' : 'Protocol'}: ${PROTOCOL_NAME[p]}`);
  const panelStyle: CSSProperties = {
    minHeight: ASSET_MANAGER_VIEW_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <Card className="relative h-[600px] gap-0 overflow-hidden bg-gray-25 py-0" style={DOTS}>
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background/60 px-6 py-8 backdrop-blur-3xl">
        <AmbientBubbles />
        <p className="relative font-medium text-base text-foreground">Choose where to start</p>
        <p className="relative mt-1 max-w-[440px] text-center font-normal text-muted-foreground text-sm">
          The map draws the vaults and markets your filters select.
        </p>
        <Tabs defaultValue="infrastructure" className="relative mt-5 w-full max-w-[720px] items-center gap-10">
          <TabsList>
            <TabsTrigger value="infrastructure">By infrastructure</TabsTrigger>
            <TabsTrigger value="protocol">By protocol</TabsTrigger>
            <TabsTrigger value="assetmanager">By asset manager</TabsTrigger>
          </TabsList>
          <TabsContent value="infrastructure" className="w-full" style={panelStyle}>
            <StartBubbleRow entries={INFRASTRUCTURE} onPick={pickProtocol} />
          </TabsContent>
          <TabsContent value="protocol" className="w-full" style={panelStyle}>
            <StartBubbleRow entries={PROTOCOLS} onPick={pickProtocol} />
          </TabsContent>
          <TabsContent value="assetmanager" className="w-full" style={panelStyle}>
            <AssetManagerBubbles onPick={(name) => setPicked(`Asset manager: ${name}`)} />
          </TabsContent>
        </Tabs>
        <p className="absolute bottom-3 text-muted-foreground text-xs">
          {picked ? `Filter applied → ${picked}` : 'Click a live bubble to apply its filter.'}
        </p>
      </div>
    </Card>
  );
}

// ── Bubble map pieces (grouped-bubble-graph.tsx, vault-map.tsx) ─────────

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
function quadAt(a: Pt, c: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}

/**
 * A dependency rope: a drooping curve from rim to rim, an arrowhead pointing at the thing depended on,
 * and the market's tag in the free gap when there is room for it. Dashed for an asset.
 */
function Cord({
  from,
  fromR,
  to,
  toR,
  color,
  dashed,
  label,
  venues,
  width = 1.5,
}: {
  from: Pt;
  fromR: number;
  to: Pt;
  toR: number;
  color: string;
  dashed?: boolean;
  label?: string;
  venues?: string[];
  width?: number;
}) {
  const len = dist(from, to) || 1;
  const c = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + Math.min(120, len * 0.4) };
  let t0 = 0;
  while (t0 < 1 && dist(quadAt(from, c, to, t0), from) < fromR) t0 += 0.005;
  let t1 = 1;
  while (t1 > t0 && dist(quadAt(from, c, to, t1), to) < toR) t1 -= 0.005;
  const gap = dist(quadAt(from, c, to, t0), quadAt(from, c, to, t1));
  const showBadge = !!label && gap > 70;
  const ta = t0 + (t1 - t0) * (showBadge ? 0.78 : 0.5);
  const tip = quadAt(from, c, to, ta);
  const back = quadAt(from, c, to, ta - 0.01);
  const angle = (Math.atan2(tip.y - back.y, tip.x - back.x) * 180) / Math.PI;
  const mid = quadAt(from, c, to, (t0 + t1) / 2);
  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} Q ${c.x} ${c.y} ${to.x} ${to.y}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeOpacity={0.75}
        strokeDasharray={dashed ? '5 5' : undefined}
      />
      {gap > 12 && (
        <path
          d={ARROW_PATH}
          fill={color}
          fillOpacity={0.75}
          transform={`translate(${tip.x}, ${tip.y}) rotate(${angle})`}
        />
      )}
      {showBadge && (
        <foreignObject x={mid.x - 60} y={mid.y - 18} width={120} height={36} style={{ overflow: 'visible' }}>
          <div className="flex h-full w-full items-center justify-center">
            <Badge variant="outline" className="max-w-[118px] bg-background" title={label}>
              {venues && <VenueMarks venues={venues} />}
              <span className="truncate">{label}</span>
            </Badge>
          </div>
        </foreignObject>
      )}
    </g>
  );
}

/** Where a bubble's risk count sits: on its rim, at the bottom-right (45°), pulled 9px in. */
const RISK_BADGE_STYLE: CSSProperties = {
  left: '85.36%',
  top: '85.36%',
  transform: 'translate(-50%, -50%) translate(-9px, -9px)',
};

/** The protocol and chain chips every vault card carries under its name. */
function ProvenanceChips({ protocol, chain }: { protocol?: Protocol; chain?: string }) {
  if (!protocol && !chain) return null;
  return (
    <div className="mt-1.5 flex items-center justify-center gap-1">
      {protocol && (
        <Badge variant="outline" className="bg-background">
          <ProtocolLogo protocol={PROTOCOL_NAME[protocol]} className="size-3.5" />
          {PROTOCOL_NAME[protocol]}
        </Badge>
      )}
      {chain && (
        <Badge variant="outline" className="min-w-0 max-w-full bg-background">
          <ChainLogo label={chain} className="size-3.5" />
          <span className="truncate">{chain}</span>
        </Badge>
      )}
    </div>
  );
}

/** Type row + name + chips + "TVL - APY": the face a vault, market or asset bubble wears. */
function BubbleFace({
  kind,
  label,
  vaultType = 'Vault',
  protocol,
  chain,
  tvl,
  apy,
}: {
  kind: 'Market' | 'Asset' | 'Vault';
  label: string;
  vaultType?: VaultType;
  protocol?: Protocol;
  chain?: string;
  tvl: number;
  apy?: number | null;
}) {
  const type: VaultType = kind === 'Vault' ? vaultType : kind;
  const railnet = type === 'Conduit' || type === 'MultiVehicle';
  return (
    <>
      {kind === 'Asset' ? (
        <TokenLogo symbol={label} />
      ) : (
        <div className="flex items-center justify-center gap-1 text-[12px] text-foreground">
          <HugeiconsIcon icon={TYPE_ICON[type]} className={cn('size-3.5', railnet && 'text-primary')} />
          <span>{TYPE_LABEL[type]}</span>
        </div>
      )}
      <div className="mt-1 w-full truncate px-1 font-semibold text-[14px] text-foreground leading-tight" title={label}>
        {label}
      </div>
      <ProvenanceChips protocol={protocol} chain={chain} />
      <div className="mt-2 font-normal text-[13px] text-muted-foreground leading-tight">
        {tvl > 0 ? fmtUsd(tvl) : '—'}
        {apy != null ? ` - ${fmtPct(apy)}` : ''}
      </div>
    </>
  );
}

/** A button when it does something, a plain box when it is decoration. */
function Hit({
  onClick,
  className,
  style,
  label,
  children,
  onHover,
}: {
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  label?: string;
  children: ReactNode;
  onHover?: (hovered: boolean) => void;
}) {
  if (!onClick) {
    return (
      <div className={cn('pointer-events-none', className)} style={style}>
        {children}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      className={cn('cursor-pointer rounded-full p-0 text-left outline-none', className)}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onFocus={() => onHover?.(true)}
      onBlur={() => onHover?.(false)}
    >
      {children}
    </button>
  );
}

const OVERLAY_SIZE = { Vault: 208, Market: 150, Asset: 150, more: 120 } as const;

type AllocationKind = keyof typeof OVERLAY_SIZE;

/** A market, asset or vault around the focus, or the dashed "+N show more" chip. */
function AllocationBubble({
  label,
  tvl,
  kind,
  x,
  y,
  highlighted = false,
  dimmed = false,
  protocol,
  chain,
  apy = null,
  vaultType = 'Vault',
  risk,
  onClick,
}: {
  label: string;
  tvl: number;
  kind: AllocationKind;
  x: number;
  y: number;
  highlighted?: boolean;
  dimmed?: boolean;
  protocol?: Protocol;
  chain?: string;
  apy?: number | null;
  vaultType?: VaultType;
  risk?: { count: number; label: string };
  onClick?: () => void;
}) {
  const size = OVERLAY_SIZE[kind];
  const style: CSSProperties = {
    left: x,
    top: y,
    width: size,
    height: size,
    opacity: dimmed ? 0.4 : 1,
    transform: `translate(-50%, -50%) scale(${highlighted ? 1.06 : 1})`,
  };
  if (kind === 'more') {
    return (
      <Hit onClick={onClick} label={`${label} more`} className="absolute" style={style}>
        <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full border border-border border-dashed bg-muted/60 text-center text-muted-foreground shadow-[0_2px_8px_rgba(32,33,36,0.06)] hover:bg-muted">
          <div className="font-semibold text-[16px] text-foreground">{label}</div>
          <div className="text-[10px]">show more</div>
        </div>
      </Hit>
    );
  }
  return (
    <Hit onClick={onClick} label={label} className="absolute transition-transform duration-150" style={style}>
      <div className="relative h-full w-full">
        <div
          className={cn(
            'flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full border bg-background p-3 text-center',
            highlighted
              ? protocol === 'railnet'
                ? 'border-deep-red border-solid shadow-[0_0_0_5px_color-mix(in_oklab,var(--deep-red)_14%,transparent)]'
                : 'border-[#0168E1] border-solid shadow-[0_0_0_5px_rgba(1,104,225,0.14)]'
              : 'border-gray-100 border-dashed shadow-[0_2px_8px_rgba(32,33,36,0.06)]',
            onClick && 'hover:border-primary/60',
          )}
        >
          <BubbleFace
            kind={kind}
            label={label}
            vaultType={vaultType}
            protocol={kind === 'Asset' ? undefined : protocol}
            chain={kind === 'Vault' ? chain : undefined}
            tvl={tvl}
            apy={apy}
          />
        </div>
        {risk && risk.count > 0 && (
          <Badge
            variant="outline"
            className="pointer-events-none absolute z-10 bg-background shadow-sm"
            style={RISK_BADGE_STYLE}
            title={risk.label}
          >
            <HugeiconsIcon icon={Flag02Icon} className="text-destructive" />
            {risk.count}
          </Badge>
        )}
      </div>
    </Hit>
  );
}

type CuratorNode = {
  label: string;
  size: number;
  protocol?: Protocol;
  chain?: string;
  vaultType?: VaultType;
  tvl: number;
  apy?: number | null;
  vaultCount?: number;
  isAggregate?: boolean;
};

/** A vault in the drill-down (selected: solid brand rim and halo), or a curator's count bubble. */
function CuratorBubble({
  node,
  x,
  y,
  selected = false,
  dimmed = false,
  risk,
  onClick,
}: {
  node: CuratorNode;
  x: number;
  y: number;
  selected?: boolean;
  dimmed?: boolean;
  risk?: { count: number; label: string };
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = node.protocol ? PROTOCOL_BORDER[node.protocol] : MORPHO_BLUE;
  return (
    <Hit
      onClick={onClick}
      onHover={setHovered}
      label={node.label}
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
      style={{ left: x, top: y, width: node.size, height: node.size, opacity: dimmed ? 0.35 : 1 }}
    >
      <div className="relative h-full w-full">
        <div
          className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-full bg-background p-3 text-center transition-colors"
          style={{
            border: selected ? `1.5px solid ${color}` : '1px dashed var(--gray-100)',
            borderColor: selected || hovered ? color : undefined,
            boxShadow: selected ? `0 0 0 6px ${color}1A, 0 4px 24px rgba(32,33,36,0.06)` : undefined,
          }}
        >
          {node.chain ? (
            <BubbleFace
              kind="Vault"
              label={node.label}
              vaultType={node.vaultType}
              protocol={node.protocol}
              chain={node.chain}
              tvl={node.tvl}
              apy={node.apy}
            />
          ) : (
            <>
              <div
                className={cn(
                  'w-full truncate px-1 font-medium text-[12px] leading-tight',
                  node.isAggregate ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {node.label}
              </div>
              <div className="mt-0.5 font-normal text-[13px] text-muted-foreground">
                {node.isAggregate ? `+ ${node.vaultCount} vaults` : `${node.vaultCount} vaults`}
              </div>
            </>
          )}
        </div>
        {risk && risk.count > 0 && (
          <Badge
            variant="outline"
            className="pointer-events-none absolute z-10 bg-background shadow-sm"
            style={RISK_BADGE_STYLE}
            title={risk.label}
          >
            <HugeiconsIcon icon={Flag02Icon} className="text-destructive" />
            {risk.count}
          </Badge>
        )}
      </div>
    </Hit>
  );
}

/** A protocol at the top of the old drill-down: its mark, name, vault count and total TVL. */
function ProtocolBubble({ protocol, vaultCount, tvl }: { protocol: Protocol; vaultCount: number; tvl: number }) {
  return (
    <div
      className="flex size-[200px] shrink-0 flex-col items-center justify-center rounded-full bg-background"
      style={{
        boxShadow: `0 0 0 1px ${PROTOCOL_BORDER[protocol]}, 0 0 0 4px ${PROTOCOL_RING[protocol]}33, 0 4px 24px rgba(32,33,36,0.08)`,
      }}
    >
      <ProtocolLogo protocol={PROTOCOL_NAME[protocol]} className="size-7 text-sm" />
      <div className="mt-2 font-medium text-base text-foreground">{PROTOCOL_NAME[protocol]}</div>
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <Badge variant="outline" className="bg-background">
          <HugeiconsIcon icon={HourglassIcon} className="size-3" />
          {vaultCount} Vaults
        </Badge>
        <Badge variant="outline" className="bg-background">
          <HugeiconsIcon icon={LockIcon} className="size-3" />
          {fmtUsd(tvl)} total TVL
        </Badge>
      </div>
    </div>
  );
}

type TrailNode = { id: string; label: string };
const VISIBLE_TRAIL_STEPS = 3;

/** The drill-down trail, root first; past three steps the middle collapses behind a … menu. */
function TrailBreadcrumb({
  root,
  trail,
  onStepClick,
}: {
  root: TrailNode | null;
  trail: TrailNode[];
  onStepClick: (index: number) => void;
}) {
  const steps = [...(root ? [{ node: root, index: -1 }] : []), ...trail.map((node, index) => ({ node, index }))];
  const first = steps[0];
  const shown =
    steps.length <= VISIBLE_TRAIL_STEPS || !first
      ? steps.map((s) => ({ ...s, hidden: [] as typeof steps }))
      : [
          { ...first, hidden: steps.slice(1, steps.length - 2) },
          ...steps.slice(-2).map((s) => ({ ...s, hidden: [] as typeof steps })),
        ];
  return (
    <Breadcrumb className="absolute top-14 left-3 z-20 max-w-[min(36rem,calc(100%-1.5rem))] overflow-hidden rounded-md border border-border bg-background px-3 py-2 text-sm shadow-xs">
      <BreadcrumbList className="flex-nowrap">
        {shown.map(({ node, index, hidden }, i) => {
          const isLast = i === shown.length - 1;
          return (
            <Fragment key={node.id}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className={isLast ? 'min-w-0' : undefined}>
                {isLast ? (
                  <BreadcrumbPage title={node.label} className="min-w-0 truncate font-semibold">
                    {node.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<button type="button" onClick={() => onStepClick(index)} title={`Back to ${node.label}`} />}
                    className="max-w-[10rem] shrink-0 truncate font-medium"
                  >
                    {node.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {hidden.length > 0 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Show ${hidden.length} hidden steps`}
                        className="rounded-sm transition-colors hover:text-foreground"
                      >
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-w-72">
                        {hidden.map((step) => (
                          <DropdownMenuItem key={step.node.id} onClick={() => onStepClick(step.index)}>
                            <span className="truncate">{step.node.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Position in the filtered list, then the actions. */
function VaultStepperBar({ index, total, children }: { index: number; total: number; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-2">
      {index >= 0 && total > 0 && (
        <span className="px-1 text-sm tabular-nums">
          <span className="text-foreground">{index + 1}/</span>
          <span className="text-muted-foreground">{total}</span>
        </span>
      )}
      {children}
    </div>
  );
}

/** Up one level, pinned to the map's top-left corner. */
function MapBackButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="absolute top-3 left-3 z-30 bg-background font-normal shadow-[0_2px_12px_rgba(32,33,36,0.10)]"
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} />
      {label}
    </Button>
  );
}

/** The arrowhead legend: the same path the ropes draw. */
function DependsOnLegend() {
  return (
    <div className="pointer-events-auto hidden items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-muted-foreground text-xs shadow-xs sm:flex">
      <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden className="shrink-0">
        <path d="M 1 5 L 15 5" stroke={MORPHO_BLUE} strokeWidth={1.5} strokeLinecap="round" />
        <path d={ARROW_PATH} fill={MORPHO_BLUE} transform="translate(24, 5)" />
      </svg>
      depends on
    </div>
  );
}

/** Zoom in/out, show every vault, compare: one joined stack in the bottom-left corner. */
function MapControls({
  onZoom,
  canZoomIn,
  canZoomOut,
  showAll,
  onShowAll,
  children,
}: {
  onZoom: (factor: number) => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  showAll?: string;
  onShowAll?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-3 z-20 flex flex-col items-start gap-2">
      <ButtonGroup orientation="vertical" className="pointer-events-auto shadow-[0_2px_12px_rgba(32,33,36,0.10)]">
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={!canZoomIn}
          onClick={() => onZoom(1.35)}
          className="size-9"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={!canZoomOut}
          onClick={() => onZoom(1 / 1.35)}
          className="size-9"
        >
          <HugeiconsIcon icon={MinusSignIcon} className="size-4" />
        </Button>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label={showAll ?? 'Showing every vault'}
                disabled={!onShowAll}
                onClick={onShowAll}
                className="size-9"
              />
            }
          >
            <HugeiconsIcon icon={BubblesIcon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {showAll ?? 'Showing every vault'}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon" aria-label="Compare to another vault" className="size-9" />}
          >
            <HugeiconsIcon icon={Layout2ColumnIcon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Compare to another vault
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
      <DependsOnLegend />
      {children}
    </div>
  );
}

/** A keyboard key inside a tooltip, drawn as the glyph itself, muted to read on a light tooltip. */
function ShortcutKey({ icon }: { icon: Icon }) {
  return (
    <Kbd className="bg-muted! text-muted-foreground!">
      <HugeiconsIcon icon={icon} />
    </Kbd>
  );
}

/** The left/right carousel arrows on the canvas edges, with their shortcut in the tooltip. */
function StepArrow({ dir, disabled, onClick }: { dir: -1 | 1; disabled: boolean; onClick: () => void }) {
  const left = dir < 0;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={left ? 'Previous vault' : 'Next vault'}
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'pointer-events-auto absolute top-1/2 z-20 size-10 -translate-y-1/2 rounded-full bg-background shadow-[0_2px_12px_rgba(32,33,36,0.10)]',
              left ? 'left-4' : 'right-4',
            )}
          />
        }
      >
        <HugeiconsIcon icon={left ? ArrowLeft02Icon : ArrowRight02Icon} className="size-4" />
      </TooltipTrigger>
      <TooltipContent side={left ? 'right' : 'left'} sideOffset={8} className="flex items-center gap-2">
        Navigate {left ? 'left' : 'right'}
        <ShortcutKey icon={left ? ArrowLeft02Icon : ArrowRight02Icon} />
      </TooltipContent>
    </Tooltip>
  );
}

// ── The vault action bar (vault-action-bar.tsx) ──────────────────────────

/** The one vault action: its details page. Disabled, with a reason, when the vault can't be resolved. */
function VaultActions({ resolvable = true }: { resolvable?: boolean }) {
  return (
    <Button
      size="sm"
      className="gap-2"
      disabled={!resolvable}
      title={resolvable ? undefined : "Vault details aren't available for this row yet"}
    >
      See vault &amp; risk details
      <HugeiconsIcon icon={ScanSearchIcon} className="size-4" />
    </Button>
  );
}

/** What two or more ticked vaults afford: putting them side by side. */
function CompareAction({ count, onCompare }: { count: number; onCompare?: () => void }) {
  return (
    <Button
      size="sm"
      className="gap-2"
      disabled={!onCompare}
      title={onCompare ? undefined : `Comparing ${count} vaults isn't built yet`}
      onClick={onCompare}
    >
      Compare
      <HugeiconsIcon icon={Layout2ColumnIcon} className="size-4" />
    </Button>
  );
}

const SWAP_OUT_MS = 120;
const SWAP_RESIZE_MS = 180;
const SWAP_IN_MS = 160;

/** Swaps one action cluster for another in three beats: out through the bottom, resize, rise in. */
function ActionSwap({ activeKey, panes }: { activeKey: string; panes: { key: string; node: ReactNode }[] }) {
  const paneRefs = useRef(new Map<string, HTMLDivElement>());
  const [shownKey, setShownKey] = useState(activeKey);
  const [resizing, setResizing] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const leaving = activeKey !== shownKey;

  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => {
      setShownKey(activeKey);
      setResizing(true);
    }, SWAP_OUT_MS);
    return () => window.clearTimeout(t);
  }, [leaving, activeKey]);

  useEffect(() => {
    if (!resizing) return;
    const t = window.setTimeout(() => setResizing(false), SWAP_RESIZE_MS);
    return () => window.clearTimeout(t);
  }, [resizing]);

  useLayoutEffect(() => {
    const el = paneRefs.current.get(shownKey);
    if (!el) return;
    const next = el.offsetWidth;
    setWidth((prev) => (prev != null && Math.abs(prev - next) < 0.5 ? prev : next));
  });

  return (
    <div
      className="grid justify-items-start transition-[width] ease-out motion-reduce:transition-none"
      style={{ width: width ?? undefined, transitionDuration: `${SWAP_RESIZE_MS}ms` }}
    >
      {panes.map((p) => {
        const up = p.key === shownKey && !leaving && !resizing;
        return (
          <div
            key={p.key}
            ref={(el) => {
              if (el) paneRefs.current.set(p.key, el);
              else paneRefs.current.delete(p.key);
            }}
            aria-hidden={!up}
            style={{ gridArea: '1 / 1', transitionDuration: up ? `${SWAP_IN_MS}ms` : `${SWAP_OUT_MS}ms` }}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap transition-[opacity,translate] ease-out motion-reduce:transition-none',
              up ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[150%] opacity-0',
            )}
          >
            {p.node}
          </div>
        );
      })}
    </div>
  );
}

/** The floating card the actions sit in, bottom-centre of the view that owns it; rises in when open. */
function FloatingActionBar({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center transition-all duration-200 ease-out',
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <div
        className={cn(
          'flex max-w-[calc(100%-2rem)] items-center gap-2 overflow-hidden rounded-md border border-border bg-background p-2 shadow-[0_4px_24px_rgba(32,33,36,0.12)]',
          open && 'pointer-events-auto',
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SelectedCount({ count }: { count: number }) {
  return (
    <span className="px-1 text-sm tabular-nums">
      <span className="text-foreground">{count}</span>
      <span className="text-muted-foreground"> selected</span>
    </span>
  );
}

// ── The map at the vault scale (vault-map.tsx) ───────────────────────────

type MapBubble = { key: string; row: ExploreRow; x: number; y: number; r: number; flagged: number };

const mapRow = (over: Partial<ExploreRow> & Pick<ExploreRow, 'id' | 'name'>): ExploreRow => ({
  ...(ROWS[0] as ExploreRow),
  ...over,
});

const MAP_BUBBLES: MapBubble[] = [
  { key: 'steakhouse-usdc', row: rowById('steakhouse-usdc'), x: 480, y: 280, r: 78, flagged: 2 },
  { key: 'gauntlet-weth', row: rowById('gauntlet-weth'), x: 150, y: 110, r: 60, flagged: 1 },
  {
    key: 'aave-usdc',
    row: mapRow({ id: 'aave-usdc', name: 'Aave v3 USDC', protocol: 'aave', type: 'Market', tvl: 2.04e9, apy: 0.0451 }),
    x: 130,
    y: 330,
    r: 70,
    flagged: 0,
  },
  { key: 'aave-usdt', row: rowById('aave-usdt'), x: 250, y: 470, r: 44, flagged: 0 },
  { key: 'coinshares', row: rowById('coinshares'), x: 820, y: 120, r: 66, flagged: 2 },
  { key: 're7-cbbtc', row: rowById('re7-cbbtc'), x: 770, y: 340, r: 54, flagged: 1 },
  {
    key: 'mev-wsteth',
    row: mapRow({ id: 'mev-wsteth', name: 'MEV Capital wstETH', asset: 'wstETH', chain: 'Arbitrum', tvl: 41e6 }),
    x: 890,
    y: 450,
    r: 40,
    flagged: 3,
  },
  { key: 'railnet-core', row: rowById('railnet-core'), x: 700, y: 510, r: 34, flagged: 0 },
  {
    key: 'block-pyusd',
    row: mapRow({ id: 'block-pyusd', name: 'Block Analitica PYUSD', asset: 'PYUSD', tvl: 22e6, apy: 0.071 }),
    x: 80,
    y: 500,
    r: 30,
    flagged: 1,
  },
  {
    key: 'smokehouse-usdt',
    row: mapRow({ id: 'smokehouse-usdt', name: 'Smokehouse USDT', asset: 'USDT', tvl: 18e6, apy: 0.0612 }),
    x: 610,
    y: 60,
    r: 28,
    flagged: 0,
  },
];

const CARD_REF_D = 218;
const SAT_R = 52;
const SAT_REF_D = 150;

/** A vault at the map's scale: the drill-down card composed at 218px and scaled to its circle. */
function VaultBubble({
  bubble,
  active,
  dimmed,
  showRisk,
  motion,
  onSelect,
  onHover,
}: {
  bubble: MapBubble;
  active: boolean;
  dimmed: boolean;
  showRisk: boolean;
  motion: (typeof MOTION)[number];
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const { row, x, y, r } = bubble;
  const color = PROTOCOL_BORDER[row.protocol];
  const d = r * 2;
  const scale = d / CARD_REF_D;
  return (
    <button
      type="button"
      aria-label={`${row.name}, ${PROTOCOL_NAME[row.protocol]} on ${row.chain}, ${fmtUsd(row.tvl)}`}
      aria-pressed={active}
      className="absolute cursor-pointer rounded-full p-0 outline-none transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-ring"
      style={{ left: x, top: y, width: d, height: d, transform: 'translate(-50%, -50%)', opacity: dimmed ? 0.45 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {showRisk && bubble.flagged > 0 && (
        <span
          className="pointer-events-none absolute z-10 flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 font-medium text-[12px] text-foreground leading-none shadow-sm"
          style={{
            left: '85.36%',
            top: '85.36%',
            transform: `translate(-50%, -50%) translate(${-9 * scale}px, ${-9 * scale}px) scale(${scale})`,
          }}
        >
          <HugeiconsIcon icon={Flag02Icon} className="size-3.5 shrink-0 text-destructive" />
          {bubble.flagged}
        </span>
      )}
      <div
        className="relative h-full w-full overflow-hidden rounded-full bg-background transition-[box-shadow,border-color] duration-150"
        style={{
          ...(active ? null : levitate({ ...motion, rise: '-6px' })),
          border: `${active ? 1.5 : 1}px ${active ? 'solid' : 'dashed'} ${active ? color : 'var(--gray-100)'}`,
          boxShadow: active ? `0 0 0 6px ${color}1A, 0 4px 24px rgba(32,33,36,0.06)` : '0 2px 8px rgba(32,33,36,0.05)',
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center text-center"
          style={{
            width: CARD_REF_D,
            height: CARD_REF_D,
            padding: 12,
            transform: `translate(-50%, -50%) scale(${scale})`,
          }}
        >
          <BubbleFace
            kind="Vault"
            label={row.name}
            vaultType={row.type === 'Market' ? 'Vault' : row.type}
            protocol={row.protocol}
            chain={row.chain}
            tvl={row.tvl}
            apy={row.apy}
          />
        </div>
      </div>
    </button>
  );
}

/** A vault's holdings fanned around it: cords from its rim, a satellite per position, "+N" last. */
function CollateralFan({ host }: { host: MapBubble }) {
  const shown = host.row.holdings.slice(0, 4);
  const rest = host.row.holdings.length - shown.length;
  const color = PROTOCOL_BORDER[host.row.protocol];
  const n = shown.length + (rest > 0 ? 1 : 0);
  const at = (i: number): Pt => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    const reach = host.r + 56 + SAT_R;
    return { x: host.x + Math.cos(a) * reach, y: host.y + Math.sin(a) * reach };
  };
  const scale = (SAT_R * 2) / SAT_REF_D;
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%" aria-hidden>
        {shown.map((h, i) => (
          <Cord
            key={h.label}
            from={host}
            fromR={host.r}
            to={at(i)}
            toR={SAT_R}
            color={color}
            dashed={h.kind === 'asset'}
            label={h.kind === 'market' ? `${h.pct.toFixed(1)}%` : undefined}
            venues={
              h.kind === 'market'
                ? [PROTOCOL_NAME[host.row.protocol === 'railnet' ? 'morpho' : host.row.protocol]]
                : undefined
            }
          />
        ))}
      </svg>
      {[...shown, null].slice(0, n).map((h, i) => {
        const p = at(i);
        return (
          <div
            key={h?.label ?? 'more'}
            className="pointer-events-none absolute"
            style={{ left: p.x - SAT_R, top: p.y - SAT_R, width: SAT_R * 2, height: SAT_R * 2 }}
          >
            <div
              className={cn(
                'fade-in zoom-in-50 flex h-full w-full animate-in flex-col items-center justify-center overflow-hidden rounded-full border border-dashed text-center shadow-[0_2px_8px_rgba(32,33,36,0.06)] duration-300',
                h ? 'border-gray-100 bg-background' : 'border-border bg-muted/60 text-muted-foreground',
              )}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div
                className="flex shrink-0 flex-col items-center justify-center text-center"
                style={{ width: SAT_REF_D, height: SAT_REF_D, padding: 12, transform: `scale(${scale})` }}
              >
                {h ? (
                  <BubbleFace
                    kind={h.kind === 'market' ? 'Market' : h.kind === 'vault' ? 'Vault' : 'Asset'}
                    label={h.kind === 'asset' ? host.row.asset : h.label}
                    protocol={
                      h.kind === 'asset' ? undefined : host.row.protocol === 'railnet' ? 'morpho' : host.row.protocol
                    }
                    tvl={h.usd}
                  />
                ) : (
                  <>
                    <div className="font-semibold text-[16px] text-foreground">+{rest}</div>
                    <div className="text-[10px]">show more</div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

const WORLD = { w: 960, h: 560 };

/** Every vault the filters admit, as floating bubbles; clicking one fans its holdings around it. */
function VaultMap() {
  const [selected, setSelected] = useState<string | null>('steakhouse-usdc');
  const [hovered, setHovered] = useState<string | null>(null);
  const [k, setK] = useState(0.9);
  const focus = MAP_BUBBLES.find((b) => b.key === (hovered ?? selected));
  const legend = (['morpho', 'aave', 'railnet'] as Protocol[]).map(
    (p) => [p, MAP_BUBBLES.filter((b) => b.row.protocol === p).length] as const,
  );
  return (
    <Card
      className="relative h-[560px] gap-0 overflow-hidden bg-gray-25 py-0"
      style={{ ...DOTS, backgroundSize: `${17 * Math.max(0.4, k)}px ${17 * Math.max(0.4, k)}px` }}
    >
      <button
        type="button"
        aria-label="Clear the selection"
        className="absolute inset-0 cursor-default"
        onClick={() => setSelected(null)}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 transition-transform duration-300 ease-out [&_button]:pointer-events-auto"
        style={{ width: WORLD.w, height: WORLD.h, transform: `translate(-50%, -50%) scale(${k})` }}
      >
        {MAP_BUBBLES.map((b, i) => (
          <VaultBubble
            key={b.key}
            bubble={b}
            active={b.key === selected || b.key === hovered}
            dimmed={!!focus && focus.key !== b.key}
            showRisk
            motion={MOTION[i % MOTION.length] ?? MOTION[0]}
            onSelect={() => setSelected(b.key)}
            onHover={(h) => setHovered(h ? b.key : null)}
          />
        ))}
        {focus && <CollateralFan key={focus.key} host={focus} />}
      </div>
      <MapBackButton label="Back to start" />
      <MapControls
        onZoom={(f) => setK((v) => Math.min(3, Math.max(0.2, v * f)))}
        canZoomIn={k < 3}
        canZoomOut={k > 0.2}
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-border bg-background px-2.5 py-1.5 text-muted-foreground text-xs shadow-xs">
          {legend.map(([p, n]) => (
            <span key={p} className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full border-[1.5px] bg-background"
                style={{ borderColor: PROTOCOL_BORDER[p] }}
              />
              {PROTOCOL_NAME[p]}
              <span className="tabular-nums">{n}</span>
            </span>
          ))}
        </div>
      </MapControls>
    </Card>
  );
}

// ── The drill-down (grouped-bubble-graph.tsx) ────────────────────────────

type Dependency = {
  id: string;
  label: string;
  kind: 'Market' | 'Asset' | 'Vault' | 'more';
  tvl: number;
  apy?: number;
  protocol?: Protocol;
  chain?: string;
  vaultType?: VaultType;
  edgeLabel?: string;
  venues?: string[];
  flagged?: number;
};

const DEPENDENCIES: Record<string, Dependency[]> = {
  'steakhouse-usdc': [
    {
      id: 'm-cbbtc',
      label: 'cbBTC/USDC',
      kind: 'Market',
      tvl: 170.1e6,
      apy: 0.071,
      protocol: 'morpho',
      edgeLabel: 'LLTV 86%',
      venues: ['Morpho'],
      flagged: 2,
    },
    {
      id: 'm-wsteth',
      label: 'wstETH/USDC',
      kind: 'Market',
      tvl: 93.3e6,
      apy: 0.054,
      protocol: 'morpho',
      edgeLabel: 'LLTV 86%',
      venues: ['Morpho'],
    },
    {
      id: 'v-gauntlet',
      label: 'Gauntlet USDC Core',
      kind: 'Vault',
      tvl: 40.5e6,
      apy: 0.052,
      protocol: 'morpho',
      chain: 'Ethereum',
    },
    { id: 'a-usdc', label: 'USDC', kind: 'Asset', tvl: 6.2e6 },
    { id: 'more', label: '+8', kind: 'more', tvl: 0 },
  ],
  'gauntlet-weth': [
    {
      id: 'm-wsteth-weth',
      label: 'wstETH/WETH',
      kind: 'Market',
      tvl: 97.6e6,
      apy: 0.031,
      protocol: 'morpho',
      edgeLabel: 'LLTV 94.5%',
      venues: ['Morpho'],
    },
    {
      id: 'm-weeth-weth',
      label: 'weETH/WETH',
      kind: 'Market',
      tvl: 57.7e6,
      apy: 0.028,
      protocol: 'morpho',
      edgeLabel: 'LLTV 94.5%',
      venues: ['Morpho'],
      flagged: 1,
    },
    { id: 'a-wsteth', label: 'wstETH', kind: 'Asset', tvl: 97.6e6 },
    { id: 'a-weth', label: 'WETH', kind: 'Asset', tvl: 8.2e6 },
    { id: 'more', label: '+3', kind: 'more', tvl: 0 },
  ],
  coinshares: [
    {
      id: 'v-core',
      label: 'Railnet USDC Core',
      kind: 'Vault',
      vaultType: 'MultiVehicle',
      tvl: 16.6e6,
      apy: 0.0502,
      protocol: 'railnet',
      chain: 'Ethereum',
    },
    {
      id: 'm-aave-usdc',
      label: 'Aave v3 USDC',
      kind: 'Market',
      tvl: 3.2e6,
      apy: 0.0451,
      protocol: 'aave',
      edgeLabel: 'Pool',
      venues: ['Aave', 'Railnet'],
    },
    {
      id: 'm-cbbtc-c',
      label: 'cbBTC/USDC',
      kind: 'Market',
      tvl: 1.6e6,
      apy: 0.071,
      protocol: 'morpho',
      edgeLabel: 'LLTV 86%',
      venues: ['Morpho', 'Railnet'],
      flagged: 2,
    },
    { id: 'a-usdc-c', label: 'USDC', kind: 'Asset', tvl: 1.0e6 },
    { id: 'more', label: '+2', kind: 'more', tvl: 0 },
  ],
};

const FOCUS_VAULTS = ['steakhouse-usdc', 'gauntlet-weth', 'coinshares'];
const GRAPH = { w: 960, h: 620 };
const HERO: Pt = { x: 480, y: 270 };
const HERO_SIZE = 218;
const SLOTS_AROUND: Pt[] = [
  { x: 190, y: 140 },
  { x: 770, y: 140 },
  { x: 200, y: 450 },
  { x: 760, y: 450 },
  { x: 480, y: 530 },
];

/** A focused vault and everything it depends on, with the trail you walked to get there. */
function GroupedBubbleGraph() {
  const [index, setIndex] = useState(0);
  const [trail, setTrail] = useState<TrailNode[]>([]);
  const [k, setK] = useState(0.85);
  const vault = rowById(FOCUS_VAULTS[index] ?? 'steakhouse-usdc');
  const deps = DEPENDENCIES[vault.id] ?? [];
  const lastId = trail[trail.length - 1]?.id;
  const rope = vault.protocol === 'railnet' ? PROTOCOL_BORDER.railnet : MORPHO_BLUE;
  const step = (dir: number) => {
    setIndex((i) => Math.max(0, Math.min(FOCUS_VAULTS.length - 1, i + dir)));
    setTrail([]);
  };
  return (
    <Card className="relative h-[620px] gap-0 overflow-hidden bg-gray-25 py-0" style={DOTS}>
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 transition-transform duration-300 ease-out [&_button]:pointer-events-auto"
        style={{ width: GRAPH.w, height: GRAPH.h, transform: `translate(-50%, -50%) scale(${k})` }}
      >
        <svg className="pointer-events-none absolute inset-0 overflow-visible" width="100%" height="100%" aria-hidden>
          {deps.map((dep, i) => {
            const to = SLOTS_AROUND[i];
            if (!to || dep.kind === 'more') return null;
            const onTrail = trail.some((t) => t.id === dep.id);
            return (
              <Cord
                key={dep.id}
                from={HERO}
                fromR={HERO_SIZE / 2}
                to={to}
                toR={OVERLAY_SIZE[dep.kind] / 2}
                color={rope}
                dashed={dep.kind === 'Asset'}
                label={dep.edgeLabel}
                venues={dep.venues}
                width={onTrail ? 3 : 1.5}
              />
            );
          })}
        </svg>
        <CuratorBubble
          node={{
            label: vault.name,
            size: HERO_SIZE,
            protocol: vault.protocol,
            chain: vault.chain,
            vaultType: vault.type,
            tvl: vault.tvl,
            apy: vault.apy,
          }}
          x={HERO.x}
          y={HERO.y}
          selected
          risk={{ count: vault.checks.filter((c) => c.level !== 'low').length, label: 'Flagged risk checks' }}
        />
        {deps.map((dep, i) => {
          const at = SLOTS_AROUND[i];
          if (!at) return null;
          return (
            <AllocationBubble
              key={dep.id}
              label={dep.label}
              kind={dep.kind}
              tvl={dep.tvl}
              apy={dep.apy}
              protocol={dep.protocol}
              chain={dep.chain}
              vaultType={dep.vaultType}
              x={at.x}
              y={at.y}
              highlighted={dep.id === lastId}
              dimmed={!!lastId && dep.id !== lastId}
              risk={dep.flagged ? { count: dep.flagged, label: 'Flagged risk checks' } : undefined}
              onClick={
                dep.kind === 'more'
                  ? undefined
                  : () =>
                      setTrail((t) => (t.some((s) => s.id === dep.id) ? t : [...t, { id: dep.id, label: dep.label }]))
              }
            />
          );
        })}
      </div>
      <MapBackButton label="Back to map" onClick={() => setTrail([])} />
      {trail.length > 0 && (
        <TrailBreadcrumb
          root={{ id: vault.id, label: vault.name }}
          trail={trail}
          onStepClick={(i) => setTrail((t) => t.slice(0, i + 1))}
        />
      )}
      <MapControls
        onZoom={(f) => setK((v) => Math.min(2, Math.max(0.45, v * f)))}
        canZoomIn={k < 2}
        canZoomOut={k > 0.45}
        showAll="Show all 429 vaults"
        onShowAll={() => undefined}
      />
      <StepArrow dir={-1} disabled={index <= 0} onClick={() => step(-1)} />
      <StepArrow dir={1} disabled={index >= FOCUS_VAULTS.length - 1} onClick={() => step(1)} />
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <div className="pointer-events-auto flex max-w-[calc(100%-2rem)] items-center overflow-hidden rounded-md border border-border bg-background shadow-[0_4px_24px_rgba(32,33,36,0.12)]">
          <VaultStepperBar index={index} total={FOCUS_VAULTS.length}>
            <VaultActions />
          </VaultStepperBar>
        </div>
      </div>
      <p className="pointer-events-none absolute top-4 right-4 text-muted-foreground text-xs">
        Click a market or vault to walk the trail
      </p>
    </Card>
  );
}

function AllocationBubbleKinds() {
  const [picked, setPicked] = useState<string | null>('Market');
  const items: {
    label: string;
    kind: AllocationKind;
    tvl: number;
    protocol?: Protocol;
    chain?: string;
    apy?: number;
    vaultType?: VaultType;
    risk?: number;
  }[] = [
    { label: 'cbBTC/USDC', kind: 'Market', tvl: 170.1e6, protocol: 'morpho', apy: 0.071, risk: 2 },
    { label: 'wstETH', kind: 'Asset', tvl: 93.3e6 },
    {
      label: 'CoinShares DeFi Income',
      kind: 'Vault',
      vaultType: 'Conduit',
      tvl: 10.4e6,
      protocol: 'railnet',
      chain: 'Ethereum',
      apy: 0.0489,
    },
    { label: '+8', kind: 'more', tvl: 0 },
  ];
  return (
    <div className="relative h-[230px] overflow-x-auto">
      <div className="relative h-full w-[720px]">
        {items.map((it, i) => (
          <AllocationBubble
            key={it.label}
            {...it}
            x={[90, 255, 450, 640][i] ?? 0}
            y={115}
            highlighted={picked === it.kind}
            risk={it.risk ? { count: it.risk, label: 'Flagged' } : undefined}
            onClick={() => setPicked(it.kind)}
          />
        ))}
      </div>
    </div>
  );
}

function CuratorBubbleModes() {
  return (
    <div className="relative h-[240px] overflow-x-auto">
      <div className="relative h-full w-[440px]">
        <CuratorBubble
          node={{
            label: 'Steakhouse USDC',
            size: 218,
            protocol: 'morpho',
            chain: 'Ethereum',
            tvl: 412.8e6,
            apy: 0.0584,
          }}
          x={115}
          y={120}
          selected
          risk={{ count: 2, label: 'Flagged' }}
        />
        <CuratorBubble
          node={{ label: 'Gauntlet', size: 120, tvl: 0, vaultCount: 38 }}
          x={300}
          y={80}
          onClick={() => undefined}
        />
        <CuratorBubble
          node={{ label: 'Other curators', size: 96, tvl: 0, vaultCount: 61, isAggregate: true }}
          x={370}
          y={185}
        />
      </div>
    </div>
  );
}

// ── Table (vault-table.tsx, risk-breakdown.tsx) ──────────────────────────

/** ✓ Strengths / 🚩 To review, in the same words on the table's hover and the map's panel. */
function RiskBreakdown({ checks }: { checks: RiskCheck[] }) {
  const strengths = checks.filter((c) => c.level === 'low');
  const toReview = checks.filter((c) => c.level !== 'low');
  return (
    <div className="space-y-3">
      {strengths.length > 0 && <RiskGroup title="Strengths" checks={strengths} level="low" />}
      {toReview.length > 0 && <RiskGroup title="To review" checks={toReview} level="high" />}
    </div>
  );
}

function RiskGroup({ title, checks, level }: { title: string; checks: RiskCheck[]; level: RiskLevel }) {
  return (
    <div>
      <div
        className={cn(
          'mb-1.5 flex items-center gap-1.5 font-medium text-sm',
          level === 'low' ? 'text-mint' : 'text-destructive',
        )}
      >
        <LevelGlyph level={level} className="size-4" />
        {title}
      </div>
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label}>
            <div className="font-medium text-foreground text-sm">{c.label}</div>
            <div className="text-muted-foreground text-xs">{c.detail}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskFactorsCell({ row }: { row: ExploreRow }) {
  const ok = row.checks.filter((c) => c.level === 'low').length;
  const flagged = row.checks.length - ok;
  if (row.checks.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={<span className="inline-flex cursor-default items-center gap-3 text-foreground" />}
      >
        {ok > 0 && (
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Tick02Icon} className="size-4 text-mint" />
            {ok}
          </span>
        )}
        {flagged > 0 && (
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Flag02Icon} className="size-4 text-destructive" />
            {flagged}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent align="end" className="max-h-(--available-height) w-80 overflow-y-auto">
        <RiskBreakdown checks={row.checks} />
      </HoverCardContent>
    </HoverCard>
  );
}

function ProtocolMarks({ labels }: { labels: string[] }) {
  return (
    <span className="flex min-w-0 items-center gap-2" title={labels.join(', ')}>
      <ProtocolLogo protocol={labels[0] ?? ''} />
      <span className="truncate">{labels.join(', ')}</span>
    </span>
  );
}

function CompositionCell({ row }: { row: ExploreRow }) {
  if (!row.via) return <>{row.composition}</>;
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={<span className="cursor-default underline decoration-dotted underline-offset-2" />}
      >
        {row.composition}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 font-normal text-xs">
        <p>
          Invests through the Multi-strategy vault <span className="font-medium text-foreground">{row.via.name}</span>:
          these are its holdings.
        </p>
        {row.via.sharedWith.length > 0 && (
          <p className="mt-2 text-muted-foreground">Also held through {row.via.sharedWith.join(', ')}.</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

function ManagedByCell({ row }: { row: ExploreRow }) {
  if (!row.curator) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {row.aaveReserve ? <ProtocolLogo protocol="Aave" /> : <CuratorAvatar name={row.curator} />}
      <span className="truncate">{row.curator}</span>
    </span>
  );
}

function IconCell({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

function TypeCell({ type }: { type: VaultType }) {
  return (
    <IconCell
      icon={<HugeiconsIcon icon={TYPE_ICON[type]} className="size-5 shrink-0 text-foreground" />}
      label={TYPE_LABEL[type]}
    />
  );
}

function ApyCell({ apy, window }: { apy: number | null; window: string }) {
  if (apy == null) return <>—</>;
  return (
    <span>
      {fmtPct(apy)} <span className="text-muted-foreground text-xs">{window}</span>
    </span>
  );
}

/** The rope that ties a child row to the row above it, stopping at the last child. */
function TreeElbow({ isLast }: { isLast: boolean }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-3 text-muted-foreground/25">
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

/** A child row (a Conduit under its MultiVehicle, or the MultiVehicle under a Conduit), in the parent's columns. */
function ChildRow({
  name,
  type,
  parent,
  apy,
  tvl,
  composition,
  isLast,
  showRisk,
}: {
  name: string;
  type: VaultType;
  parent: ExploreRow;
  apy: number | null;
  tvl: number;
  composition?: string;
  isLast: boolean;
  showRisk: boolean;
}) {
  return (
    <TableRow className="border-0 bg-muted/30 text-foreground hover:bg-muted/50">
      <TableCell className="relative pl-12 font-medium" title={name}>
        <TreeElbow isLast={isLast} />
        <span className="block truncate">{name}</span>
      </TableCell>
      <TableCell>
        <TypeCell type={type} />
      </TableCell>
      <TableCell>
        <IconCell icon={<TokenLogo symbol={parent.asset} />} label={parent.asset} />
      </TableCell>
      <TableCell>
        <ProtocolMarks labels={['Railnet']} />
      </TableCell>
      <TableCell>—</TableCell>
      <TableCell>
        <IconCell icon={<ChainLogo label={parent.chain} />} label={parent.chain} />
      </TableCell>
      <TableCell className="tabular-nums">
        <ApyCell apy={apy} window={parent.apyWindow} />
      </TableCell>
      <TableCell className="tabular-nums">{fmtUsd(tvl)}</TableCell>
      <TableCell className="text-foreground">{composition}</TableCell>
      {showRisk && <TableCell>—</TableCell>}
    </TableRow>
  );
}

type SortKey = 'name' | 'apy' | 'tvl';
type TableSort = { key: SortKey; dir: 'asc' | 'desc' };

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: TableSort;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <TableHead className={className} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onSort(sortKey)}
        className="-mx-2 h-auto w-[calc(100%+1rem)] justify-start gap-1 whitespace-normal px-2 py-1 text-left font-[inherit] text-[length:inherit] text-inherit leading-[inherit] tracking-[inherit] hover:text-foreground"
      >
        {label}
        {active && (
          <HugeiconsIcon icon={sort.dir === 'asc' ? ArrowUp02Icon : ArrowDown02Icon} className="size-3.5 shrink-0" />
        )}
      </Button>
    </TableHead>
  );
}

const MAX_COMPARE = 2;

/** The table view: sortable, rows that open in place, tick two to compare, risk counters on hover. */
function VaultTable() {
  const [sort, setSort] = useState<TableSort>({ key: 'tvl', dir: 'desc' });
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['railnet-core']);
  const [comparing, setComparing] = useState(false);
  const showRisk = true;
  const rows = [...ROWS].sort((a, b) => {
    const s = sort.dir === 'asc' ? 1 : -1;
    if (sort.key === 'name') return a.name.localeCompare(b.name) * s;
    return ((a[sort.key] ?? 0) - (b[sort.key] ?? 0)) * s;
  });
  const onSort = (key: SortKey) =>
    setSort((p) => (p.key === key ? { key, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const picked = rows.filter((r) => selected.includes(r.id));
  const full = selected.length >= MAX_COMPARE;
  return (
    <div className="relative pb-16">
      <Card className="gap-0 overflow-x-auto py-0">
        <Table className="min-w-[1100px] table-fixed">
          <TableHeader className="[&_th]:bg-background [&_th]:shadow-[inset_0_-1px_0_var(--border)]">
            <TableRow>
              <SortableHead label="Name" sortKey="name" sort={sort} onSort={onSort} className="w-[18%]" />
              <TableHead className="w-[11%]">Type</TableHead>
              <TableHead className="w-[8%]">Asset</TableHead>
              <TableHead className="w-[13%]">Protocol / Infrastructure</TableHead>
              <TableHead className="w-[10%]">Managed by</TableHead>
              <TableHead className="w-[8%]">Chain</TableHead>
              <SortableHead label="APY" sortKey="apy" sort={sort} onSort={onSort} className="w-[7%]" />
              <SortableHead label="TVL" sortKey="tvl" sort={sort} onSort={onSort} className="w-[8%]" />
              <TableHead className="w-[9%]">Composition</TableHead>
              {showRisk && <TableHead className="w-[8%]">Risk factors</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const ticked = selected.includes(r.id);
              const expandable = r.conduits.length > 0 || r.via != null;
              const open = expanded.includes(r.id);
              return (
                <Fragment key={r.id}>
                  <TableRow className="group cursor-pointer">
                    <TableCell className="font-medium text-foreground" title={r.name}>
                      <span
                        className={cn(
                          'relative flex min-w-0 items-center transition-[padding] duration-150 ease-out',
                          ticked ? 'pl-[26px]' : 'pl-0 focus-within:pl-[26px] group-hover:pl-[26px]',
                        )}
                      >
                        <Checkbox
                          checked={ticked}
                          disabled={full && !ticked}
                          title={
                            full && !ticked ? `Comparing takes ${MAX_COMPARE} vaults — untick one first` : undefined
                          }
                          onCheckedChange={() => setSelected((s) => toggle(s, r.id))}
                          aria-label={`Select ${r.name}`}
                          className="absolute left-0 -translate-x-1.5 opacity-0 transition-[opacity,transform] duration-150 ease-out focus-visible:translate-x-0 focus-visible:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 data-checked:translate-x-0 data-unchecked:bg-background data-checked:opacity-100"
                        />
                        {expandable && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setExpanded((s) => toggle(s, r.id))}
                            aria-expanded={open}
                            aria-label={`${open ? 'Hide' : 'Show'} what sits under ${r.name}`}
                            className="mr-1 size-4 text-muted-foreground hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent"
                          >
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              className={cn('size-3.5 transition-transform duration-150', open && 'rotate-90')}
                            />
                          </Button>
                        )}
                        <span className="truncate">{r.name}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <TypeCell type={r.type} />
                    </TableCell>
                    <TableCell>
                      <span className="flex min-w-0 items-center gap-2">
                        <TokenLogo symbol={r.asset} />
                        <Button
                          variant="link"
                          className="h-auto min-w-0 truncate p-0 font-normal text-inherit underline underline-offset-2"
                        >
                          {r.asset}
                        </Button>
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProtocolMarks labels={[PROTOCOL_NAME[r.protocol]]} />
                    </TableCell>
                    <TableCell title={r.curator ?? undefined}>
                      <ManagedByCell row={r} />
                    </TableCell>
                    <TableCell>
                      <IconCell icon={<ChainLogo label={r.chain} />} label={r.chain} />
                    </TableCell>
                    <TableCell>
                      <ApyCell apy={r.apy} window={r.apyWindow} />
                    </TableCell>
                    <TableCell>{fmtUsd(r.tvl)}</TableCell>
                    <TableCell className="text-foreground">
                      <CompositionCell row={r} />
                    </TableCell>
                    {showRisk && (
                      <TableCell>
                        <RiskFactorsCell row={r} />
                      </TableCell>
                    )}
                  </TableRow>
                  {open &&
                    r.conduits.map((c, i) => (
                      <ChildRow
                        key={c.address}
                        name={c.name}
                        type="Conduit"
                        parent={r}
                        apy={c.apy}
                        tvl={c.tvl}
                        isLast={i === r.conduits.length - 1}
                        showRisk={showRisk}
                      />
                    ))}
                  {open && r.via && (
                    <ChildRow
                      name={r.via.name}
                      type="MultiVehicle"
                      parent={r}
                      apy={r.apy}
                      tvl={r.tvl}
                      composition={r.composition}
                      isLast
                      showRisk={showRisk}
                    />
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <FloatingActionBar open={picked.length > 0}>
        <SelectedCount count={picked.length} />
        <ActionSwap
          activeKey={picked.length > 1 ? 'compare' : 'single'}
          panes={[
            { key: 'single', node: <VaultActions /> },
            { key: 'compare', node: <CompareAction count={picked.length} onCompare={() => setComparing(true)} /> },
          ]}
        />
      </FloatingActionBar>
      <VaultCompareDialog targets={picked} open={comparing && picked.length > 1} onOpenChange={setComparing} />
    </div>
  );
}

// ── Compare dialog (vault-compare-dialog.tsx) ────────────────────────────

const BAR_TINTS = ['bg-primary', 'bg-primary/55', 'bg-primary/30'] as const;

function Metric({
  metricKey,
  icon,
  label,
  value,
  hint,
  hovered,
  onHover,
}: {
  metricKey: string;
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  return (
    <div
      onPointerEnter={() => onHover(metricKey)}
      onPointerLeave={() => onHover(null)}
      className={cn(
        'flex items-center justify-between gap-3 border-transparent border-y px-6 py-[5px] text-sm transition-colors',
        hovered === metricKey && 'border-border',
      )}
    >
      <dt className="flex min-w-0 items-center gap-2 text-foreground">
        <HugeiconsIcon icon={icon} className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="flex shrink-0 items-center gap-2 text-right text-muted-foreground tabular-nums">
        <span>{value}</span>
        {hint && <span>{hint}</span>}
      </dd>
    </div>
  );
}

function CompareCard({
  row,
  dividerRight,
  hovered,
  onHover,
}: {
  row: ExploreRow;
  dividerRight: boolean;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const markets = [...row.holdings].sort((a, b) => b.pct - a.pct);
  const shown = markets.slice(0, BAR_TINTS.length);
  const hidden = markets.length - shown.length;
  return (
    <section
      className={cn('row-span-3 grid min-w-0 grid-rows-subgrid gap-y-0', dividerRight && 'border-border border-r')}
    >
      <header className="flex min-w-0 items-start justify-between gap-2 px-6 pt-5">
        <div className="min-w-0">
          <h3 className="truncate font-sans font-semibold text-base text-foreground" title={row.name}>
            {row.name}
          </h3>
          <div className="mt-2 flex items-center -space-x-1.5">
            {[
              <TokenLogo key="t" symbol={row.asset} />,
              <ProtocolLogo key="p" protocol={PROTOCOL_NAME[row.protocol]} />,
              row.curator ? <CuratorAvatar key="c" name={row.curator} /> : null,
              <ChainLogo key="n" label={row.chain} />,
            ].map((node) =>
              node ? (
                <span key={node.key} className="inline-flex rounded-full ring-2 ring-background">
                  {node}
                </span>
              ) : null,
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="See vault & risk details" title="See vault & risk details">
          <HugeiconsIcon icon={ScanSearchIcon} className="size-4" />
        </Button>
      </header>
      <dl className="pt-[18px] pb-5">
        <Metric
          metricKey="tvl"
          icon={BankIcon}
          label="TVL"
          value={fmtUsd(row.tvl)}
          hovered={hovered}
          onHover={onHover}
        />
        <Metric
          metricKey="apy"
          icon={PercentIcon}
          label={`APY (${row.apyWindow})`}
          value={row.apy != null ? fmtPct(row.apy) : '—'}
          hovered={hovered}
          onHover={onHover}
        />
        <Metric
          metricKey="liquidity"
          icon={DropletIcon}
          label="Available liquidity"
          value={fmtUsd(row.liquidity)}
          hint={`(${Math.round((row.liquidity / row.tvl) * 100)}% of TVL)`}
          hovered={hovered}
          onHover={onHover}
        />
      </dl>
      <div className="border-border border-t px-6 py-5">
        <h4 className="font-medium text-muted-foreground text-sm">Markets &amp; Collateral</h4>
        <div className="mt-6 flex h-2 w-full gap-0.5 overflow-hidden bg-muted">
          {shown.map((h, i) => (
            <span key={h.label} className={cn('h-full', BAR_TINTS[i])} style={{ width: `${h.pct}%` }} />
          ))}
        </div>
        <ul className="mt-3 space-y-3">
          {shown.map((h, i) => (
            <li key={h.label} className="flex min-w-0 items-center gap-2 text-sm">
              <span className={cn('size-2.5 shrink-0 rounded-[3px]', BAR_TINTS[i])} aria-hidden />
              <span className="flex shrink-0 items-center -space-x-1">
                {h.collaterals[0] && (
                  <span className="inline-flex rounded-full ring-2 ring-background">
                    <TokenLogo symbol={h.collaterals[0]} />
                  </span>
                )}
                <span className="inline-flex rounded-full ring-2 ring-background">
                  <TokenLogo symbol={row.asset} />
                </span>
              </span>
              <span className="truncate text-foreground">{h.label}</span>
              <span className="ml-auto shrink-0 text-foreground tabular-nums">{h.pct.toFixed(2)}%</span>
            </li>
          ))}
          {hidden > 0 && (
            <li>
              <Button
                variant="link"
                className="ml-[18px] h-auto p-0 font-normal text-muted-foreground hover:text-foreground"
              >
                +{hidden} more
              </Button>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function CompareFlags({ row, dividerRight }: { row: ExploreRow; dividerRight: boolean }) {
  const flagged = row.checks.filter((c) => c.level !== 'low');
  return (
    <div className={cn('min-h-0 min-w-0 overflow-y-auto', dividerRight && 'border-border border-r')}>
      <div className="pb-5">
        <div className="sticky top-0 z-10">
          <div className="bg-background px-6 pt-5">
            <h4 className="font-medium text-muted-foreground text-sm">Flagged in the vault report</h4>
          </div>
          <div aria-hidden className="h-6 bg-gradient-to-b from-background to-transparent" />
        </div>
        {flagged.length === 0 ? (
          <p className="px-6 text-muted-foreground text-sm">Nothing flagged on this vault.</p>
        ) : (
          <ul className="space-y-2.5 px-6">
            {flagged.map((c) => (
              <li key={c.label} className="flex gap-2 text-sm">
                <HugeiconsIcon icon={Flag02Icon} className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
                <span className="min-w-0 text-foreground">
                  <span className="font-medium">{c.label}:</span> {c.detail}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Two vaults read row against row: identity, KPIs (hover lights both columns), top markets, flags. */
function CompareBody({ targets }: { targets: ExploreRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <>
      <div className="grid shrink-0 grid-cols-2 grid-rows-[auto_auto_auto]">
        {targets.map((t, i) => (
          <CompareCard key={t.id} row={t} dividerRight={i === 0} hovered={hovered} onHover={setHovered} />
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 border-border border-t">
        {targets.map((t, i) => (
          <CompareFlags key={t.id} row={t} dividerRight={i === 0} />
        ))}
      </div>
    </>
  );
}

const compareTitle = (targets: ExploreRow[]) => {
  const [a, b] = targets;
  return a && b ? `Comparing ${a.name} & ${b.name}` : 'Comparing vaults';
};

function VaultCompareDialog({
  targets,
  open,
  onOpenChange,
}: {
  targets: ExploreRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(720px,calc(100vh-4rem))] max-w-[min(880px,calc(100vw-3rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(880px,calc(100vw-3rem))]">
        <DialogHeader className="shrink-0 border-border border-b px-6 py-4">
          <DialogTitle className="font-semibold text-base">{compareTitle(targets)}</DialogTitle>
          <DialogDescription className="sr-only">Two vaults side by side.</DialogDescription>
        </DialogHeader>
        <CompareBody targets={targets} />
      </DialogContent>
    </Dialog>
  );
}

/** The comparison drawn inline, as the dialog's body shows it. */
function VaultCompareCard() {
  const targets = [rowById('steakhouse-usdc'), rowById('gauntlet-weth')];
  return (
    <div className="flex max-h-[640px] flex-col overflow-hidden border border-border bg-background shadow-sm">
      <div className="shrink-0 border-border border-b px-6 py-4 font-semibold text-base">{compareTitle(targets)}</div>
      <CompareBody targets={targets} />
    </div>
  );
}

// ── Command palette (command-palette.tsx) ────────────────────────────────

// ── Empty state, scroll fades, shortcut key (explore-empty-state.tsx …) ──

// ── The page ─────────────────────────────────────────────────────────────

/** The explore page's own screens: the start screen, the two maps, the bubbles, the table and the comparison. */
export function RiskExplore() {
  return (
    <>
      <ExploreStartState />
      <VaultMap />
      <GroupedBubbleGraph />
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_22rem]">
        <VaultTable />
        <Card className="p-4">
          <RiskBreakdown checks={VAULT_CHECKS} />
        </Card>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <AllocationBubbleKinds />
        <div className="space-y-4">
          <CuratorBubbleModes />
          <div className="flex gap-4 overflow-x-auto p-2">
            <ProtocolBubble protocol="morpho" vaultCount={471} tvl={8.4e9} />
            <ProtocolBubble protocol="aave" vaultCount={212} tvl={21.2e9} />
          </div>
        </div>
      </div>
      <VaultCompareCard />
    </>
  );
}
