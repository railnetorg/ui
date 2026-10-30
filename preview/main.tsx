import {
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
  Clock01Icon,
  Coins01Icon,
  Copy01Icon,
  Moon02Icon,
  PlusSignIcon,
  Sun03Icon,
  Tick02Icon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Bar, BarChart, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VERSION = 'v0.2.0';
const INSTALL_COMMAND = `bunx shadcn@latest add railnetorg/ui/railnet-theme#${VERSION}`;

const APY_HISTORY = [
  { month: 'May', apy: 5.8 },
  { month: 'Jun', apy: 6.1 },
  { month: 'Jul', apy: 5.9 },
  { month: 'Aug', apy: 6.6 },
  { month: 'Sep', apy: 6.3 },
  { month: 'Oct', apy: 6.9 },
];
const APY_CHART: ChartConfig = { apy: { label: 'Net APY', color: 'var(--chart-1)' } };

const POSITIONS = [
  { id: 'usdc', label: 'USDC product', value: '$420,000', progress: 65, caption: '65% of the target allocation' },
  { id: 'eth', label: 'ETH product', value: '$85,000', progress: 32, caption: '32% of the target allocation' },
];

const ACTIVITY = [
  {
    id: 'q-1',
    title: 'Deposit',
    detail: 'USDC product',
    amount: '+$25,000',
    icon: ArrowDownLeft01Icon,
    state: 'Completed',
  },
  {
    id: 'q-2',
    title: 'Redeem',
    detail: 'ETH product',
    amount: '−4.20 ETH',
    icon: ArrowUpRight01Icon,
    state: 'In progress',
  },
  {
    id: 'q-3',
    title: 'Rewards claimed',
    detail: 'USDC product',
    amount: '+$312.40',
    icon: Coins01Icon,
    state: 'Completed',
  },
] as const;

const BRAND_COLORS = [
  'deep-red',
  'soft-black',
  'bone',
  'peach',
  'coral',
  'blaze',
  'rust',
  'spruce',
  'sage',
  'mint',
  'petrol',
  'glacier',
];
const SEMANTIC_COLORS = ['primary', 'secondary', 'muted', 'accent', 'destructive', 'border'];

const CHART_COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const FIXED_SETTINGS = [
  { label: 'Style', value: 'Base Maia' },
  { label: 'Icons', value: 'Hugeicons' },
  { label: 'Radius', value: '0' },
];
const RULES = [
  'A brand value changes in tokens.css only, through a PR on this repo.',
  'Install the theme with shadcn add; never retype its values.',
  'Copied components are yours: change them freely.',
  'ABC Marist is licensed: each app serves the font file itself.',
  'Nothing client-specific or internal in this public repo.',
];

type SettingRowProps = { label: string; value: string; children?: React.ReactNode };

function SettingRow({ label, value, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-sm">{value}</p>
      </div>
      {children}
    </div>
  );
}

type SidebarProps = { dark: boolean; onToggleDark: () => void };

function Sidebar({ dark, onToggleDark }: SidebarProps) {
  const [copied, setCopied] = useState(false);

  async function copyInstallCommand() {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
  }

  return (
    <aside className="dark flex flex-col border bg-background text-foreground lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between border-b px-4 py-4">
        <div>
          <p className="font-serif text-xl">Railnet UI</p>
          <p className="text-[11px] text-muted-foreground">{VERSION}</p>
        </div>
        <Button variant="secondary" size="icon" aria-label="Toggle dark mode" onClick={onToggleDark}>
          <HugeiconsIcon icon={dark ? Sun03Icon : Moon02Icon} />
        </Button>
      </div>

      <div className="lg:flex-1 lg:overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-1">
          <SettingRow label="Primary" value="Deep red">
            <span className="size-3 shrink-0 bg-deep-red" />
          </SettingRow>
          <SettingRow label="Chart colors" value="Ember">
            <span className="flex shrink-0">
              {CHART_COLORS.map((color) => (
                <span key={color} className="size-3" style={{ background: `var(--${color})` }} />
              ))}
            </span>
          </SettingRow>
          <SettingRow label="Heading" value="ABC Marist">
            <span className="font-serif text-lg">Aa</span>
          </SettingRow>
          <SettingRow label="Font" value="Inter Tight">
            <span className="text-lg">Aa</span>
          </SettingRow>
          {FIXED_SETTINGS.map((setting) => (
            <SettingRow key={setting.label} label={setting.label} value={setting.value} />
          ))}
        </div>

        <div className="space-y-2 px-4 py-4">
          <p className="text-section-label">Rules</p>
          <ol className="list-decimal space-y-1.5 pl-4 text-muted-foreground text-xs">
            {RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="space-y-2 border-t p-4">
        <code className="block break-all bg-muted p-2 text-[11px] text-muted-foreground">{INSTALL_COMMAND}</code>
        <Button className="w-full" onClick={copyInstallCommand}>
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} />
          {copied ? 'Copied' : 'Copy install command'}
        </Button>
      </div>
    </aside>
  );
}

function PerformanceCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Performance</CardTitle>
        <CardDescription>Net APY over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={APY_CHART} className="aspect-auto h-44 w-full">
          <BarChart data={APY_HISTORY} barCategoryGap="30%">
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="apy" fill="var(--color-apy)" />
          </BarChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted p-3">
            <p className="text-muted-foreground text-xs">Next settlement</p>
            <p className="font-medium">Nov 3, 2026</p>
            <p className="text-muted-foreground text-xs">$12,400 queued</p>
          </div>
          <div className="bg-muted p-3">
            <p className="text-muted-foreground text-xs">Net APY</p>
            <p className="font-medium">6.90%</p>
            <p className="text-muted-foreground text-xs">After fees</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View full report
        </Button>
      </CardFooter>
    </Card>
  );
}

function DepositCard() {
  const [amount, setAmount] = useState(2500);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Deposit</CardTitle>
        <CardDescription>Choose an asset and an amount.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="deposit">
          <TabsList className="w-full">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="redeem">Redeem</TabsTrigger>
          </TabsList>
        </Tabs>
        <Field>
          <FieldLabel htmlFor="asset">Asset</FieldLabel>
          <NativeSelect id="asset" defaultValue="usdc">
            <NativeSelectOption value="usdc">USDC</NativeSelectOption>
            <NativeSelectOption value="usdt">USDT</NativeSelectOption>
            <NativeSelectOption value="weth">WETH</NativeSelectOption>
          </NativeSelect>
        </Field>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-sm">Amount</span>
            <span className="text-3xl text-stat">${amount.toLocaleString('en-US')}</span>
          </div>
          <Slider
            value={amount}
            min={50}
            max={10000}
            step={50}
            onValueChange={(value) => setAmount(Array.isArray(value) ? (value[0] ?? 0) : value)}
          />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>$50</span>
            <span>$10,000</span>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="reference">Reference</FieldLabel>
          <Input id="reference" placeholder="Optional" />
        </Field>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Deposit</Button>
      </CardFooter>
    </Card>
  );
}

function PositionsCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription>Allocation per product</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {POSITIONS.map((position) => (
          <div key={position.id} className="space-y-2 border p-4">
            <p className="text-muted-foreground text-sm">{position.label}</p>
            <p className="text-4xl text-stat">{position.value}</p>
            <Progress value={position.progress} />
            <p className="text-muted-foreground text-xs">{position.caption}</p>
          </div>
        ))}
      </CardContent>
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
            <HugeiconsIcon icon={PlusSignIcon} />
            Explore products
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
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

type SwatchesProps = { title: string; colors: string[] };

function Swatches({ title, colors }: SwatchesProps) {
  return (
    <div className="space-y-2">
      <p className="text-section-label">{title}</p>
      <div className="grid grid-cols-6 gap-1.5">
        {colors.map((color) => (
          <div key={color} className="space-y-1">
            <div className="aspect-square border" style={{ background: `var(--${color})` }} />
            <p className="truncate text-[10px] text-muted-foreground">{color}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokensCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
        <CardDescription>From tokens.css, the only place a brand value lives.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Swatches title="Semantic" colors={SEMANTIC_COLORS} />
        <Swatches title="Brand" colors={BRAND_COLORS} />
        <div className="space-y-1">
          <p className="text-section-label">Typography</p>
          <p className="text-4xl text-stat">$12,431,902</p>
          <p className="font-heading text-xl">Programmable yield for DeFi</p>
          <p className="text-label">Label · Inter Tight</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Preview() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? 'dark' : undefined}>
      <div className="flex min-h-screen flex-col gap-4 bg-background p-4 text-foreground lg:flex-row lg:items-start">
        <Sidebar dark={dark} onToggleDark={() => setDark(!dark)} />
        <main className="flex-1 columns-1 gap-4 md:columns-2 2xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          <PerformanceCard />
          <DepositCard />
          <TokensCard />
          <PositionsCard />
          <RewardsCard />
          <EmptyCard />
          <ActivityCard />
        </main>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<Preview />);
