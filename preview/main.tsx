import { createRoot } from 'react-dom/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BUTTON_VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const BADGE_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'brand',
  'success',
  'error',
  'destructive',
  'ghost',
] as const;
const SEMANTIC_COLORS = ['primary', 'secondary', 'muted', 'accent', 'destructive', 'border', 'input', 'ring'] as const;
const BRAND_COLORS = [
  'deep-red',
  'soft-black',
  'bone',
  'peach',
  'coral',
  'ember',
  'blaze',
  'rust',
  'spruce',
  'sage',
  'mint',
  'petrol',
  'glacier',
  'aqua',
] as const;
const CHART_COLORS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const;
const ROWS = [
  { id: 'q-1', product: 'USDC Prime', apy: '6.42%', tvl: '$12.4M' },
  { id: 'q-2', product: 'ETH Yield', apy: '3.91%', tvl: '$4.1M' },
];

type SwatchesProps = { title: string; colors: readonly string[] };

function Swatches({ title, colors }: SwatchesProps) {
  return (
    <div className="space-y-2">
      <p className="text-section-label">{title}</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {colors.map((color) => (
          <div key={color} className="space-y-1">
            <div className="h-10 border" style={{ background: `var(--${color})` }} />
            <p className="truncate text-muted-foreground text-xs">{color}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type GalleryProps = { mode: 'light' | 'dark' };

function Gallery({ mode }: GalleryProps) {
  return (
    <section className={mode === 'dark' ? 'dark' : undefined}>
      <div className="space-y-8 bg-background p-6 text-foreground">
        <div className="space-y-1">
          <p className="text-section-label">{mode}</p>
          <h2 className="font-serif text-4xl">Railnet UI</h2>
          <p className="text-muted-foreground">Base components, styled by the Railnet theme.</p>
        </div>

        <Swatches title="Semantic" colors={SEMANTIC_COLORS} />
        <Swatches title="Brand" colors={BRAND_COLORS} />
        <Swatches title="Charts" colors={CHART_COLORS} />

        <div className="space-y-2">
          <p className="text-section-label">Typography</p>
          <p className="text-5xl text-stat">$12,431,902</p>
          <p className="text-2xl text-body-lg">Programmable yield for DeFi</p>
          <p className="text-label">Label</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Deposit</CardTitle>
              <CardDescription>Card, field, checkbox and switch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`amount-${mode}`}>Amount</Label>
                <Input id={`amount-${mode}`} placeholder="0.00" />
              </div>
              <Label className="gap-2">
                <Checkbox defaultChecked /> I accept the terms
              </Label>
              <Label className="gap-2">
                <Switch defaultChecked /> Notifications
              </Label>
              <Progress value={62} />
              <Button className="w-full">Deposit</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Alert>
              <AlertTitle>Redeem queued</AlertTitle>
              <AlertDescription>Your request settles at the next epoch.</AlertDescription>
            </Alert>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>TVL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ROWS.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.product}</TableCell>
                        <TableCell>{row.apy}</TableCell>
                        <TableCell>{row.tvl}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="activity">
                <Skeleton className="h-24 w-full" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <main className="grid xl:grid-cols-2">
      <Gallery mode="light" />
      <Gallery mode="dark" />
    </main>,
  );
}
