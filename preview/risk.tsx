import { RiskExplore } from '@preview/risk/explore';
import { RiskVault } from '@preview/risk/vault';

/**
 * The screens the Risk app (railnetorg/vault-intelligence) builds from this registry, as Examples does for the
 * Railnet app: rebuilt from its markup with mock data.
 */
export function Risk() {
  return (
    <div className="space-y-4">
      <RiskExplore />
      <RiskVault />
    </div>
  );
}
