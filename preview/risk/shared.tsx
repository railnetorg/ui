import { Flag02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Stand-in for a token, protocol, chain or curator logo: the registry Avatar with the initial, as the app falls back. */
export function Mark({ label, className }: { label: string; className?: string }) {
  return (
    <Avatar size="sm" className={className}>
      <AvatarFallback className="font-semibold text-[10px]">{label.trim().charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskCheck = { label: string; level: RiskLevel; detail: string };

export const LEVEL_LABEL: Record<RiskLevel, string> = { low: 'Strength', medium: 'Watch', high: 'Risk' };

/**
 * The Risk app's Badge carries three variants the registry does not ship. They are rebuilt here as
 * class overrides on `brand`, with the same values as `apps/dashboard/src/components/ui/badge.tsx`.
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

const LEVEL_VARIANT: Record<RiskLevel, 'success' | 'warning' | 'error'> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

/** The assessment chip: the assessor's own verdict when there is one, the level word otherwise. */
export function AssessmentBadge({ level, label }: { level: RiskLevel; label?: string }) {
  return <ProjectBadge variant={LEVEL_VARIANT[level]}>{label ?? LEVEL_LABEL[level]}</ProjectBadge>;
}

/** ✓ for a strength, a flag for anything to review: the pair used everywhere risk is shown. */
export function LevelGlyph({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <HugeiconsIcon
      icon={level === 'low' ? Tick02Icon : Flag02Icon}
      className={cn(level === 'low' ? 'text-mint' : 'text-destructive', className)}
    />
  );
}

/** ✓ or flag with an optional count, as it sits at the right of a risk row. */
export function LevelChip({ level, count }: { level: RiskLevel; count?: number }) {
  return (
    <Badge variant="outline" className="shrink-0 rounded-full">
      <LevelGlyph level={level} />
      {count}
    </Badge>
  );
}

/** Flags first, then passing checks: the summary a collapsed group shows. */
export function LevelTally({ levels }: { levels: RiskLevel[] }) {
  const flagged = levels.filter((level) => level !== 'low');
  const passing = levels.length - flagged.length;
  return (
    <span className="inline-flex gap-1">
      {flagged.length > 0 && <LevelChip level={flagged.includes('high') ? 'high' : 'medium'} count={flagged.length} />}
      {passing > 0 && <LevelChip level="low" count={passing} />}
    </span>
  );
}

/** Mock data shared by the specimens, shaped like the app's vault rows. */
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

export const VAULTS = [
  {
    name: 'Steakhouse USDC',
    curator: 'Steakhouse',
    asset: 'USDC',
    protocol: 'Morpho',
    chain: 'Ethereum',
    tvl: '$412.8M',
    apy: '5.84%',
    checks: VAULT_CHECKS,
  },
  {
    name: 'Gauntlet WETH Prime',
    curator: 'Gauntlet',
    asset: 'WETH',
    protocol: 'Morpho',
    chain: 'Base',
    tvl: '$186.2M',
    apy: '2.91%',
    checks: VAULT_CHECKS.slice(0, 4),
  },
  {
    name: 'Aave v3 USDT',
    curator: 'Aave DAO',
    asset: 'USDT',
    protocol: 'Aave',
    chain: 'Ethereum',
    tvl: '$1.21B',
    apy: '4.12%',
    checks: VAULT_CHECKS.slice(0, 3),
  },
  {
    name: 'CoinShares DeFi Income',
    curator: 'CoinShares',
    asset: 'USDC',
    protocol: 'Railnet',
    chain: 'Ethereum',
    tvl: '$10K',
    apy: '4.89%',
    checks: VAULT_CHECKS,
  },
];
