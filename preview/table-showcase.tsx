import { Fragment } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableLoading,
  TablePagination,
  TableRow,
  TableTreeLine,
} from '@/components/ui/table';

const ROWS = [
  {
    name: 'USDC Prime',
    asset: 'USDC',
    apy: '6.42%',
    tvl: '$12.4M',
    status: 'Live',
    children: [
      { name: 'Morpho USDC', apy: '6.80%', tvl: '$8.1M' },
      { name: 'Aave v3 USDC', apy: '5.71%', tvl: '$4.3M' },
    ],
  },
  { name: 'ETH Staking Plus', asset: 'WETH', apy: '3.18%', tvl: '$4.9M', status: 'Live' },
  { name: 'cbBTC Carry', asset: 'cbBTC', apy: '—', tvl: '—', status: 'Soon' },
];

/** Every part of the Table at once: figures, nested rows with their tree line, a total. */
function RegistryTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>APY</TableHead>
          <TableHead>TVL</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <Fragment key={row.name}>
            <TableRow>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.asset}</TableCell>
              <TableCell numeric>{row.apy}</TableCell>
              <TableCell numeric>{row.tvl}</TableCell>
              <TableCell>
                <Badge variant={row.status === 'Live' ? 'success' : 'outline'}>{row.status}</Badge>
              </TableCell>
            </TableRow>
            {row.children?.map((child, i) => (
              <TableRow key={child.name} nested>
                <TableCell>
                  <TableTreeLine last={i === row.children.length - 1} />
                  {child.name}
                </TableCell>
                <TableCell>{row.asset}</TableCell>
                <TableCell numeric>{child.apy}</TableCell>
                <TableCell numeric>{child.tvl}</TableCell>
                <TableCell />
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell />
          <TableCell />
          <TableCell numeric>$17.3M</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}

/** The Table with all it draws itself, full width under the component cards. */
export function TableShowcase() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Table</CardTitle>
        <CardDescription>
          Frame, sticky header, nested rows, total, pager, empty and loading states: all from the component, no class
          from outside.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegistryTable />
        <TablePagination page={1} pageCount={4}>
          {ROWS.length} products
        </TablePagination>
        <div className="grid gap-4 md:grid-cols-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>TVL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty colSpan={2} />
            </TableBody>
          </Table>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>TVL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableLoading columns={2} rows={3} />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
