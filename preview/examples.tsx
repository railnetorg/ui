import {
  ArrowDown01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Clock01Icon,
  Coins01Icon,
  FavouriteIcon,
  FilterIcon,
  LinkSquare02Icon,
  PlusSignIcon,
  Search01Icon,
  Shield01Icon,
  Tick02Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Area, AreaChart, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const PRODUCTS = [
  {
    id: 'usdc-prime',
    name: 'USDC Prime',
    description: 'Diversified stablecoin yield across established lending markets, rebalanced by its asset manager.',
    tvl: '$12.4M',
    apy: '6.42%',
    manager: 'Northwind',
    asset: 'USDC',
    chain: 'Base',
    launchingSoon: false,
  },
  {
    id: 'eth-staking',
    name: 'ETH Staking Plus',
    description: 'Liquid staking return, enhanced with a conservative lending leg.',
    tvl: '—',
    apy: '—',
    manager: 'Northwind',
    asset: 'WETH',
    chain: 'Ethereum',
    launchingSoon: true,
  },
];

const TVL_HISTORY = [
  { day: 'Oct 1', tvl: 10.2 },
  { day: 'Oct 5', tvl: 10.8 },
  { day: 'Oct 9', tvl: 10.5 },
  { day: 'Oct 13', tvl: 11.4 },
  { day: 'Oct 17', tvl: 11.1 },
  { day: 'Oct 21', tvl: 11.9 },
  { day: 'Oct 25', tvl: 12.6 },
  { day: 'Oct 29', tvl: 12.4 },
];
const SHARE_PRICE_HISTORY = [
  { day: 'Oct 1', tvl: 1.031 },
  { day: 'Oct 5', tvl: 1.032 },
  { day: 'Oct 9', tvl: 1.034 },
  { day: 'Oct 13', tvl: 1.035 },
  { day: 'Oct 17', tvl: 1.037 },
  { day: 'Oct 21', tvl: 1.038 },
  { day: 'Oct 25', tvl: 1.04 },
  { day: 'Oct 29', tvl: 1.041 },
];
const PERFORMANCE_CHART: ChartConfig = { tvl: { label: 'Value', color: 'var(--chart-1)' } };

const EARNINGS = [
  { year: '2026', value: 0 },
  { year: '2027', value: 160 },
  { year: '2028', value: 330 },
  { year: '2029', value: 510 },
  { year: '2030', value: 700 },
  { year: '2031', value: 900 },
];
const EARNINGS_CHART: ChartConfig = { value: { label: 'Earnings', color: 'var(--chart-1)' } };
const HORIZONS = ['1M', '1Y', '3Y', '5Y'];
const DEPOSIT_SHARES = ['25%', '50%', '75%', 'Max'];

const HOLDINGS = [
  { id: 'aave', label: 'Aave V3 USDC', allocation: 45, balance: '$5.58M', apy: '5.10%', color: 'var(--chart-1)' },
  { id: 'morpho', label: 'Morpho USDC', allocation: 35, balance: '$4.34M', apy: '7.80%', color: 'var(--chart-2)' },
  { id: 'maple', label: 'Syrup USDC', allocation: 12, balance: '$1.49M', apy: '9.20%', color: 'var(--chart-3)' },
  { id: 'idle', label: 'Idle', allocation: 8, balance: '$0.99M', apy: '—', color: 'var(--muted-foreground)' },
];

const PENDING = [
  { id: 'q-12', kind: 'Redeem', amount: '4.20 ETH', state: 'In progress', variant: 'brand', hint: 'Settles Nov 3' },
  {
    id: 'q-11',
    kind: 'Deposit',
    amount: '25,000 USDC',
    state: 'Finalizing',
    variant: 'brand',
    hint: 'Claim ready soon',
  },
  { id: 'q-10', kind: 'Redeem', amount: '1,200 USDC', state: 'Completed', variant: 'success', hint: '' },
] as const;

const TX_STEPS = [
  { id: 'approve', label: 'Approve USDC', detail: 'Allow the Conduit to move 2,500 USDC', status: 'done' },
  { id: 'deposit', label: 'Deposit', detail: 'Confirm in your wallet', status: 'active' },
  { id: 'settle', label: 'Receive rnUSDC', detail: 'Shares land in your wallet', status: 'todo' },
] as const;

const ACTIVITY = [
  {
    id: 'a-1',
    title: 'Deposit',
    detail: 'USDC Prime',
    amount: '+$25,000',
    icon: ArrowDownLeft01Icon,
    state: 'Completed',
  },
  {
    id: 'a-2',
    title: 'Redeem',
    detail: 'ETH Staking Plus',
    amount: '−4.20 ETH',
    icon: ArrowUpRight01Icon,
    state: 'In progress',
  },
  {
    id: 'a-3',
    title: 'Rewards claimed',
    detail: 'USDC Prime',
    amount: '+$312.40',
    icon: Coins01Icon,
    state: 'Completed',
  },
] as const;

type TokenMarkProps = { symbol: string; size?: 'sm' | 'default' };

function TokenMark({ symbol, size = 'sm' }: TokenMarkProps) {
  return (
    <Avatar size={size}>
      <AvatarFallback className="text-[10px]">{symbol.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}

function ExploreToolbar() {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <p className="font-medium">All products</p>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search..." />
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          <Tabs defaultValue="30d">
            <TabsList>
              <TabsTrigger value="7d">APY 7D</TabsTrigger>
              <TabsTrigger value="30d">APY 30D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline">
            <HugeiconsIcon icon={FilterIcon} data-icon="inline-start" />
            Asset manager
          </Button>
          <Button variant="outline">
            <HugeiconsIcon icon={FilterIcon} data-icon="inline-start" />
            Network
          </Button>
          <Toggle variant="outline">
            <HugeiconsIcon icon={FavouriteIcon} />
            Favorites
          </Toggle>
        </div>
      </CardContent>
    </Card>
  );
}

type ProductCardProps = { product: (typeof PRODUCTS)[number] };

function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      size="sm"
      className={
        product.launchingSoon ? 'relative overflow-visible border-dashed' : 'relative cursor-pointer hover:bg-accent/50'
      }
    >
      {product.launchingSoon ? (
        <Badge variant="outline" className="absolute -top-3 right-4 z-10 gap-1.5 bg-card">
          <HugeiconsIcon icon={Clock01Icon} />
          Launching soon
        </Badge>
      ) : null}
      <CardHeader>
        <CardTitle className="font-semibold text-base">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-muted-foreground text-sm">{product.description}</p>
        <div className="flex gap-6">
          <div>
            <p className="text-muted-foreground text-sm">TVL</p>
            <p className="font-medium text-lg">{product.tvl}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">APY (30D)</p>
            <p className="font-medium text-lg">{product.apy}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className={product.launchingSoon ? 'gap-4 border-t border-dashed' : 'gap-4 border-t'}>
        {[product.manager, product.asset, product.chain].map((label) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-sm">
            <TokenMark symbol={label} />
            {label}
          </span>
        ))}
      </CardFooter>
    </Card>
  );
}

function ConduitHeaderCard() {
  const [metric, setMetric] = useState<'tvl' | 'sharePrice'>('tvl');

  return (
    <Card size="sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl">
              USDC Prime <span className="text-muted-foreground">rnUSDC</span>
            </h2>
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              0x210c…f6d3
              <Button variant="link" size="xs" className="h-auto px-0">
                Explorer
                <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-end" />
              </Button>
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Add to favorites">
            <HugeiconsIcon icon={FavouriteIcon} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-muted-foreground text-sm">TVL</p>
            <p className="text-3xl text-stat">$12.4M</p>
            <p className="text-muted-foreground text-xs">12,402,118 USDC</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Share price</p>
            <p className="text-3xl text-stat">$1.04</p>
            <p className="text-muted-foreground text-xs">1 rnUSDC ≈ 1.0412 USDC</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-muted-foreground text-sm">
              APY 30D
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
            </p>
            <p className="text-3xl text-stat">6.42%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-medium text-sm">Performance</p>
          <Tabs
            value={metric}
            onValueChange={(value) => {
              if (value === 'tvl' || value === 'sharePrice') setMetric(value);
            }}
          >
            <TabsList>
              <TabsTrigger value="tvl">TVL</TabsTrigger>
              <TabsTrigger value="sharePrice">Share price</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <ChartContainer config={PERFORMANCE_CHART} className="aspect-auto h-48 w-full">
          <AreaChart data={metric === 'tvl' ? TVL_HISTORY : SHARE_PRICE_HISTORY}>
            <defs>
              <linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-tvl)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-tvl)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area dataKey="tvl" type="linear" stroke="var(--color-tvl)" strokeWidth={2} fill="url(#performance-fill)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function DepositWidget() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button>
          Deposit
          <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
        </Button>
        <Button variant="outline">Redeem</Button>
        <Button variant="outline">
          Pending
          <Spinner data-icon="inline-end" />
        </Button>
      </div>
      <div>
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>You deposit</span>
              <span>Balance: 12,278.31</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-medium">
                <TokenMark symbol="USDC" size="default" />
                USDC
              </span>
              <input
                aria-label="Amount"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full min-w-0 bg-transparent text-right text-3xl outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            <p className="text-right text-muted-foreground text-xs">~$0.00</p>
            <ToggleGroup size="sm" spacing={1}>
              {DEPOSIT_SHARES.map((share) => (
                <ToggleGroupItem key={share} value={share} className="bg-muted">
                  {share}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>
        <div className="relative z-10 -my-2 flex justify-center">
          <span className="flex size-8 items-center justify-center rounded-full border bg-background">
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 text-muted-foreground" />
          </span>
        </div>
        <Card size="sm">
          <CardContent className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Estimated receive</p>
              <p className="font-medium">rnUSDC</p>
            </div>
            <p className="text-3xl">0.00</p>
          </CardContent>
        </Card>
      </div>
      <Card size="sm">
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs">Estimated earnings</p>
            <p className="text-3xl text-stat">$0.00</p>
          </div>
          <ChartContainer config={EARNINGS_CHART} className="aspect-auto h-28 w-full">
            <AreaChart data={EARNINGS}>
              <defs>
                <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <Area
                dataKey="value"
                type="linear"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="url(#earnings-fill)"
              />
            </AreaChart>
          </ChartContainer>
          <Tabs defaultValue="5Y">
            <TabsList>
              {HORIZONS.map((horizon) => (
                <TabsTrigger key={horizon} value={horizon}>
                  {horizon}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">APY 30D</span>
            <span className="font-medium tabular-nums">6.42%</span>
          </div>
        </CardContent>
      </Card>
      <Button size="lg" className="w-full" disabled>
        Enter amount
      </Button>
    </div>
  );
}

function HoldingsCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative mx-auto size-44">
          <PieChart width={176} height={176}>
            <Pie
              data={HOLDINGS}
              dataKey="allocation"
              innerRadius={66}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {HOLDINGS.map((holding) => (
                <Cell key={holding.id} fill={holding.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-xs">Total</p>
            <p className="font-medium text-lg">$12.40M</p>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
              <TableHead className="text-right">APY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HOLDINGS.map((holding) => (
              <TableRow key={holding.id}>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 shrink-0" style={{ background: holding.color }} />
                    {holding.label}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{holding.allocation}.00%</TableCell>
                <TableCell className="text-right tabular-nums">{holding.apy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AllocationCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <CardDescription>Where the product's assets sit today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {HOLDINGS.map((holding) => (
            <span key={holding.id} style={{ flexGrow: holding.allocation, background: holding.color }} />
          ))}
        </div>
        {HOLDINGS.map((holding) => (
          <div key={holding.id} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: holding.color }} />
            <span className="min-w-0 flex-1 truncate">{holding.label}</span>
            <span className="text-muted-foreground tabular-nums">{holding.allocation}%</span>
            <span className="min-w-16 text-right font-semibold tabular-nums">{holding.balance}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PendingCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Pending</CardTitle>
        <CardDescription>Deposits and redeems waiting for settlement</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Query</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PENDING.map((query) => (
              <TableRow key={query.id}>
                <TableCell>{query.kind}</TableCell>
                <TableCell className="tabular-nums">{query.amount}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={query.variant}>{query.state}</Badge>
                    {query.hint ? <p className="text-muted-foreground text-xs">{query.hint}</p> : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TxStepperCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Deposit 2,500 USDC</CardTitle>
        <CardDescription>Two transactions, in this order</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {TX_STEPS.map((step, index) => (
            <li key={step.id} className="flex gap-3">
              <span
                className={
                  step.status === 'todo'
                    ? 'flex size-6 shrink-0 items-center justify-center rounded-full border text-muted-foreground text-xs'
                    : 'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs'
                }
              >
                {step.status === 'done' ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                ) : step.status === 'active' ? (
                  <Spinner className="size-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <div>
                <p className={step.status === 'todo' ? 'text-muted-foreground text-sm' : 'font-medium text-sm'}>
                  {step.label}
                </p>
                <p className="text-muted-foreground text-xs">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}

function RoleGrantCard() {
  return (
    <Alert>
      <HugeiconsIcon icon={Shield01Icon} />
      <AlertTitle>Missing role</AlertTitle>
      <AlertDescription>Your wallet needs the curator role on this Vehicle before it can allocate.</AlertDescription>
      <AlertAction>
        <Button size="sm">Grant role</Button>
      </AlertAction>
    </Alert>
  );
}

function RewardsCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>Claimable rewards</CardDescription>
        <p className="text-5xl text-stat">$0.00</p>
        <Badge variant="brand" className="w-fit">
          <HugeiconsIcon icon={Clock01Icon} />
          Pending settlement
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Accrued</span>
          <span>$0.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fees</span>
          <span>−$0.00</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Ready to claim</span>
          <span>$0.00</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled>
          Claim
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyCard() {
  return (
    <Card size="sm">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Wallet01Icon} />
          </EmptyMedia>
          <EmptyTitle>No product yet</EmptyTitle>
          <EmptyDescription>Deposit into a product to see your position and earnings here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">
            <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
            Explore products
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}

function ActivityCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Deposits, redeems and claims</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {ACTIVITY.map((activity) => (
            <Item key={activity.id} size="sm">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={activity.icon} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{activity.title}</ItemTitle>
                <ItemDescription>{activity.detail}</ItemDescription>
              </ItemContent>
              <ItemActions className="flex-col items-end gap-1">
                <span className="font-medium text-sm">{activity.amount}</span>
                <Badge variant={activity.state === 'Completed' ? 'success' : 'brand'}>{activity.state}</Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}

export function Examples() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="columns-1 gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        <ExploreToolbar />
        {PRODUCTS.map((product) => (
          <div key={product.id} className={product.launchingSoon ? 'pt-3' : undefined}>
            <ProductCard product={product} />
          </div>
        ))}
        <ConduitHeaderCard />
        <HoldingsCard />
        <AllocationCard />
        <PendingCard />
        <RoleGrantCard />
        <TxStepperCard />
        <RewardsCard />
        <EmptyCard />
        <ActivityCard />
      </div>
      <DepositWidget />
    </div>
  );
}
