import { Flag02Icon, InformationCircleIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

/**
 * The Risk app's shared layer, one version of each piece, as `apps/dashboard/src/components/common/` and
 * `components/risk/` build them. Explore and the vault page both draw from here.
 */

// ── Logos (common/logos.tsx) ─────────────────────────────────────────────

/** Brand colours the logo stand-ins are drawn in, where the app would load the image. */
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

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

/**
 * Every logo is the registry Avatar at 20px, as in the app: the image when it loads, else the initial on a muted
 * circle. No images ship here, so a known brand's colour fills the circle in place of its image.
 */
function Logo({ label, style, className }: { label: string; style?: CSSProperties; className?: string }) {
  const color = BRAND[label];
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

/** A curator or entity with no known mark: its initial on a soft hue hashed from the name. */
const hueStyle = (name: string): CSSProperties => {
  const hue = hashHue(name);
  return { backgroundColor: `hsl(${hue} 85% 90%)`, color: `hsl(${hue} 55% 32%)` };
};

export function TokenLogo({ symbol, className }: { symbol: string; className?: string }) {
  return <Logo label={symbol} className={className} />;
}

export function ChainLogo({ label, className }: { label: string; className?: string }) {
  return <Logo label={label} className={className} />;
}

export function ProtocolLogo({ protocol, className }: { protocol: string; className?: string }) {
  return <Logo label={protocol} className={className} />;
}

export function CuratorAvatar({ name, className }: { name: string; className?: string }) {
  return <Logo label={name} className={className} style={hueStyle(name)} />;
}

/** An issuer or custodian: the same chip as a curator. */
export const EntityAvatar = CuratorAvatar;

// ── LogoStack (common/logo-stack.tsx) ────────────────────────────────────

export type LogoStackItem = { key: string; logo: ReactNode };

/**
 * Logos overlapped, the first laid over the second. The 2px ring is drawn in the colour behind the stack, so it
 * reads as a gap: the page background by default, `ringClassName` on a tinted surface. `size`: 16px ("sm") for
 * dense rows and tags, 20px ("md") everywhere else. `max` caps how many are drawn; the rest is counted as "+N".
 */
export function LogoStack({
  items,
  size = 'sm',
  max,
  ringClassName = 'ring-background',
  className,
}: {
  items: LogoStackItem[];
  size?: 'sm' | 'md';
  max?: number;
  ringClassName?: string;
  className?: string;
}) {
  const shown = max != null ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <span className={cn('isolate inline-flex shrink-0 items-center', className)}>
      {shown.map((item, i) => (
        <span
          key={item.key}
          style={{ zIndex: shown.length - i }}
          className={cn(
            'relative inline-flex rounded-full ring-2',
            size === 'md' ? '[&>img]:size-5 [&>span]:size-5' : '[&>img]:size-4 [&>span]:size-4',
            ringClassName,
            i > 0 && (size === 'md' ? '-ml-2' : '-ml-1.5'),
          )}
        >
          {item.logo}
        </span>
      ))}
      {rest > 0 && <span className="ml-1.5 text-muted-foreground">+{rest}</span>}
    </span>
  );
}

/** Token logos as stack items, the shape most stacks are built from. */
export const tokenLogoItems = (symbols: string[]): LogoStackItem[] =>
  symbols.map((s) => ({ key: s, logo: <TokenLogo symbol={s} /> }));

/** Protocol marks as stack items, by display name ("Morpho", "Aave"). */
export const protocolLogoItems = (protocols: string[]): LogoStackItem[] =>
  protocols.map((p) => ({ key: p, logo: <ProtocolLogo protocol={p} /> }));

// ── TreeElbow (common/tree-elbow.tsx) ────────────────────────────────────

/**
 * The elbow that ties a child row to the row it hangs from, stopping at the last one. Positioned by its `relative`
 * cell: `left` is where a depth-1 rope runs (24px in the explore table, 22px in the vault page's trees).
 */
export function TreeElbow({ isLast, depth = 1, left }: { isLast: boolean; depth?: 1 | 2; left: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 w-3 text-muted-foreground/25"
      style={{ left: left + (depth - 1) * 24 }}
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

// ── InfoTip (common/info-tip.tsx) ────────────────────────────────────────

/** An info glyph beside a label that explains it in a HoverCard. `iconSize`: "md" 16px, "sm" 14px. */
export function InfoTip({
  label,
  children,
  iconSize = 'md',
  className,
}: {
  label: string;
  children: ReactNode;
  iconSize?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            className={cn(
              'size-5 cursor-default text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent',
              className,
            )}
          >
            <HugeiconsIcon icon={InformationCircleIcon} className={iconSize === 'sm' ? 'size-3.5' : 'size-4'} />
          </Button>
        }
      />
      <HoverCardContent align="start" className="w-80 font-normal text-xs">
        {children}
      </HoverCardContent>
    </HoverCard>
  );
}

// ── FloatingActionBar (common/floating-action-bar.tsx) ───────────────────

/**
 * The floating card the actions sit in, bottom-centre of the view that owns it; rises in when open. `padded`: false
 * when the content brings its own padding (the vault stepper). `raised`: false where the view layers by hand.
 */
export function FloatingActionBar({
  open,
  padded = true,
  raised = true,
  className,
  children,
}: {
  open: boolean;
  padded?: boolean;
  raised?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-all duration-200 ease-out',
        raised && 'z-20',
        open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      <div
        className={cn(
          'flex max-w-[calc(100%-2rem)] items-center gap-2 overflow-hidden rounded-md border border-border bg-background shadow-[0_4px_24px_rgba(32,33,36,0.12)]',
          padded && 'p-2',
          open && 'pointer-events-auto',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Risk (risk/*) ────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskCheck = { label: string; level: RiskLevel; detail: string };

export const LEVEL_LABEL: Record<RiskLevel, string> = { low: 'Strength', medium: 'Watch', high: 'Risk' };

/**
 * The Risk app's Badge carries variants the registry does not ship. They are rebuilt here as class overrides on
 * `brand`, with the same values as `apps/dashboard/src/components/ui/badge.tsx`.
 */
const PROJECT_VARIANT = {
  warning: 'bg-coral/10 text-coral',
  info: 'bg-glacier/10 text-glacier',
  neutral: 'bg-muted text-muted-foreground',
};

type ProjectBadgeProps = Omit<ComponentProps<typeof Badge>, 'variant'> & {
  variant?: ComponentProps<typeof Badge>['variant'] | keyof typeof PROJECT_VARIANT;
};

export function ProjectBadge({ variant = 'default', className, ...props }: ProjectBadgeProps) {
  if (variant && variant in PROJECT_VARIANT) {
    return (
      <Badge
        variant="brand"
        className={cn(PROJECT_VARIANT[variant as keyof typeof PROJECT_VARIANT], className)}
        {...props}
      />
    );
  }
  return <Badge variant={variant as ComponentProps<typeof Badge>['variant']} className={className} {...props} />;
}

/** risk/assessment-badge.tsx: the level as a chip. */
export const LEVEL_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'error'> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

/** The assessor's own verdict when there is one, the level word otherwise; `float` floats it right. */
export function AssessmentBadge({ level, label, float }: { level: RiskLevel; label?: string | null; float?: boolean }) {
  return (
    <ProjectBadge variant={LEVEL_VARIANT[level]} className={float ? 'float-right mb-3 ml-3' : undefined}>
      {label || LEVEL_LABEL[level]}
    </ProjectBadge>
  );
}

/**
 * risk/risk-count-badge.tsx: the flag-and-count chip straddling a bubble's rim at the lower-right diagonal, pulled
 * 9px back along it. `scale`: the vault map scales it with its bubbles. Positioned by a `relative` parent.
 */
export function RiskCountBadge({ count, label, scale = 1 }: { count: number; label: string; scale?: number }) {
  if (count <= 0) return null;
  return (
    <Badge
      variant="outline"
      className="pointer-events-none absolute z-10 bg-background shadow-sm"
      style={{
        left: '85.36%',
        top: '85.36%',
        transform:
          scale === 1
            ? 'translate(-50%, -50%) translate(-9px, -9px)'
            : `translate(-50%, -50%) translate(${-9 * scale}px, ${-9 * scale}px) scale(${scale})`,
      }}
      title={label}
    >
      <HugeiconsIcon icon={Flag02Icon} className="text-destructive" />
      {count}
    </Badge>
  );
}

/** risk/risk-breakdown.tsx: ✓ Strengths / flag To review, in the same words wherever a vault's checks are listed. */
export function RiskBreakdown({ checks }: { checks: RiskCheck[] }) {
  const strengths = checks.filter((c) => c.level === 'low');
  const toReview = checks.filter((c) => c.level !== 'low');
  return (
    <div className="space-y-3">
      {strengths.length > 0 && <RiskGroup title="Strengths" checks={strengths} tone="green" />}
      {toReview.length > 0 && <RiskGroup title="To review" checks={toReview} tone="red" />}
    </div>
  );
}

function RiskGroup({ title, checks, tone }: { title: string; checks: RiskCheck[]; tone: 'green' | 'red' }) {
  return (
    <div>
      <div
        className={cn(
          'mb-1.5 flex items-center gap-1.5 font-medium text-sm',
          tone === 'green' ? 'text-success' : 'text-destructive',
        )}
      >
        <HugeiconsIcon icon={tone === 'green' ? Tick02Icon : Flag02Icon} className="size-4" />
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

/** The ✓ and flag counts of a set of checks: strengths are the low ones, everything else is to review. */
export function riskCounts(checks: RiskCheck[]): { ok: number; flagged: number } {
  const ok = checks.filter((c) => c.level === 'low').length;
  return { ok, flagged: checks.length - ok };
}

/**
 * risk/risk-factors-cell.tsx: ✓ and flag counters as bare glyphs, the checks on hover. `scrollable`: caps the card
 * at the viewport and scrolls past it. (The app's `isolateClicks` is left out: no preview row opens on click.)
 */
export function RiskFactorsCell({
  ok,
  flagged,
  checks,
  scrollable = false,
}: {
  ok: number;
  flagged: number;
  checks: RiskCheck[];
  scrollable?: boolean;
}) {
  if (ok === 0 && flagged === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={80}
        closeDelay={40}
        render={<span className="inline-flex cursor-default items-center gap-3 text-foreground" />}
      >
        {ok > 0 && (
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Tick02Icon} className="size-4 text-success" />
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
      <HoverCardContent align="end" className={cn('w-80', scrollable && 'max-h-(--available-height) overflow-y-auto')}>
        <RiskBreakdown checks={checks} />
      </HoverCardContent>
    </HoverCard>
  );
}

/** Mock checks shared by the screens, shaped like the app's vault rows. */
export const VAULT_CHECKS: RiskCheck[] = [
  { label: 'Curator track record', level: 'low', detail: 'Curating since 2024 with no loss event across 14 vaults.' },
  { label: 'Oracle design', level: 'low', detail: 'Every market prices its collateral from a Chainlink feed.' },
  { label: 'Timelock', level: 'low', detail: 'Allocation changes wait 3 days before they apply.' },
  { label: 'Concentration', level: 'medium', detail: '41% of the book sits in a single market.' },
  {
    label: 'Liquidation probability',
    level: 'high',
    detail: 'One market runs at 94% utilisation with thin exit depth.',
  },
];
