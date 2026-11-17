import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FilterBar,
  FilterClear,
  FilterMenu,
  type FilterOption,
  FilterPill,
  FilterPills,
  FilterRange,
  FilterSearch,
  FilterSelect,
} from '@/components/ui/filter';

const logo = (name: string) => (
  <Avatar>
    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
  </Avatar>
);

const MANAGERS: FilterOption[] = [
  ['9Summits', 1],
  ['AaveV3Arbitrum', 19],
  ['AaveV3Base', 15],
  ['AaveV3Ethereum', 65],
  ['Gauntlet', 38],
  ['MEV Capital', 17],
  ['Re7 Labs', 21],
  ['Steakhouse', 24],
  ['CoinShares', 1],
].map(([label, count]) => ({
  value: String(label),
  label: String(label),
  count: Number(count),
  icon: logo(String(label)),
}));

const CHAINS: FilterOption[] = [
  ['Ethereum', 312],
  ['Base', 141],
  ['Arbitrum', 58],
].map(([label, count]) => ({
  value: String(label),
  label: String(label),
  count: Number(count),
  icon: logo(String(label)),
}));

const ROLES: FilterOption[] = ['Admin', 'Curator', 'Viewer'].map((role) => ({ value: role, label: role }));

const fmtUsd = (value: number) => (value >= 1e6 ? `$${(value / 1e6).toFixed(1)}M` : `$${Math.round(value / 1e3)}K`);
const fmtPct = (value: number) => `${(value * 100).toFixed(1)}%`;

/** The filter pieces working together, as a list page wires them. */
export function FilterShowcase() {
  const [search, setSearch] = useState('');
  const [managers, setManagers] = useState<string[]>(['AaveV3Ethereum']);
  const [chains, setChains] = useState<string[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [tvl, setTvl] = useState(1_000_000);
  const [apy, setApy] = useState(0);
  const [favorites, setFavorites] = useState(false);

  const active = managers.length > 0 || chains.length > 0 || role.length > 0 || tvl > 0 || apy > 0 || favorites;
  const clear = () => {
    setManagers([]);
    setChains([]);
    setRole([]);
    setTvl(0);
    setApy(0);
    setFavorites(false);
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Search, one pill per active filter, clear, and the add-filter menu. Pick-lists, floors and yes/no filters,
          with the same option list in a pill and in the menu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FilterBar>
          <FilterSearch value={search} onValueChange={setSearch} placeholder="Search vaults" />
          <FilterPills>
            <FilterSelect label="Asset manager" options={MANAGERS} value={managers} onValueChange={setManagers} />
            <FilterSelect label="Chain" options={CHAINS} value={chains} onValueChange={setChains} />
            <FilterSelect label="Role" options={ROLES} value={role} onValueChange={setRole} multiple={false} />
            <FilterRange label="TVL" value={tvl} onValueChange={setTvl} max={50_000_000} format={fmtUsd} />
            <FilterRange label="APY" value={apy} onValueChange={setApy} max={0.3} step={0.005} format={fmtPct} />
            {favorites && <FilterPill label="Favorites" onClear={() => setFavorites(false)} />}
          </FilterPills>
          {active && <FilterClear onClick={clear} />}
          <FilterMenu
            items={[
              {
                kind: 'select',
                id: 'manager',
                label: 'Asset manager',
                options: MANAGERS,
                value: managers,
                onValueChange: setManagers,
              },
              { kind: 'select', id: 'chain', label: 'Chain', options: CHAINS, value: chains, onValueChange: setChains },
              {
                kind: 'select',
                id: 'role',
                label: 'Role',
                options: ROLES,
                value: role,
                onValueChange: setRole,
                multiple: false,
              },
              {
                kind: 'range',
                id: 'tvl',
                label: 'TVL',
                value: tvl,
                onValueChange: setTvl,
                max: 50_000_000,
                format: fmtUsd,
              },
              {
                kind: 'range',
                id: 'apy',
                label: 'APY',
                value: apy,
                onValueChange: setApy,
                max: 0.3,
                step: 0.005,
                format: fmtPct,
              },
              {
                kind: 'toggle',
                id: 'favorites',
                label: 'Favorites',
                checked: favorites,
                onCheckedChange: setFavorites,
              },
            ]}
          />
        </FilterBar>
      </CardContent>
    </Card>
  );
}
