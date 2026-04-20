/**
 * VIXUAL -- IP Reputation Service
 *
 * Abstraction layer for VPN / Proxy / Tor / Datacenter detection.
 * Pluggable: swap StubProvider for ipinfo, ipqualityscore, Cloudflare, etc.
 *
 * The result is used as a *signal* to set riskFlags on the user document.
 */

export interface IpReputationResult {
  vpn?: boolean;
  proxy?: boolean;
  tor?: boolean;
  datacenter?: boolean;
  country?: string;
  asn?: string;
  provider?: string;
}

export interface IpReputationProvider {
  lookup(ip: string): Promise<IpReputationResult>;
}

// ── Stub provider (dev / fallback) ──
export class StubIpReputationProvider implements IpReputationProvider {
  async lookup(_ip: string): Promise<IpReputationResult> {
    return { provider: "stub" };
  }
}

// ── Vercel-header-based provider (production) ──
// Reads Vercel / Cloudflare headers when available.
export class VercelHeaderProvider implements IpReputationProvider {
  private headers: Headers;
  constructor(headers: Headers) {
    this.headers = headers;
  }
  async lookup(_ip: string): Promise<IpReputationResult> {
    const country = this.headers.get("x-vercel-ip-country") ?? undefined;
    return { country, provider: "vercel-headers" };
  }
}

// ── Factory ──
let _provider: IpReputationProvider | null = null;

export function getIpReputationProvider(): IpReputationProvider {
  if (!_provider) {
    // In production, swap for a real provider (ipqualityscore, etc.)
    _provider = new StubIpReputationProvider();
  }
  return _provider;
}

export function setIpReputationProvider(p: IpReputationProvider) {
  _provider = p;
}

/**
 * Quick helper: lookup IP and return risk flags ready for the user document.
 */
export async function getIpRiskFlags(
  ip: string,
  provider?: IpReputationProvider
): Promise<{
  vpnSuspected: boolean;
  proxySuspected: boolean;
  torSuspected: boolean;
  datacenterIp: boolean;
  ipCountry?: string;
}> {
  const p = provider ?? getIpReputationProvider();
  const result = await p.lookup(ip);
  return {
    vpnSuspected: result.vpn ?? false,
    proxySuspected: result.proxy ?? false,
    torSuspected: result.tor ?? false,
    datacenterIp: result.datacenter ?? false,
    ipCountry: result.country,
  };
}
