/**
 * VIXUAL - Fraud Detection AI Engine
 * 
 * Analyseur de comportement avec Risk Score dynamique
 * Détection multi-comptes, VIXUpoints anormaux, activité suspecte
 */

export interface RiskAssessment {
  riskScore: number; // 0-100
  severity: 'normal' | 'watch' | 'suspect' | 'critical';
  reasons: string[];
  confidence: number; // 0-100
  timestamp: Date;
}

export interface FraudSignal {
  type: 'action_frequency' | 'vixupoints_spike' | 'multi_account' | 'content_manipulation' | 'payment_anomaly' | 'vpn_detected';
  weight: number; // 0-100
  description: string;
  evidenceCount: number;
}

export const RISK_THRESHOLDS = {
  normal: { min: 0, max: 24 },
  watch: { min: 25, max: 49 },
  suspect: { min: 50, max: 74 },
  critical: { min: 75, max: 100 },
} as const;

export function getRiskSeverity(score: number): 'normal' | 'watch' | 'suspect' | 'critical' {
  if (score <= 24) return 'normal';
  if (score <= 49) return 'watch';
  if (score <= 74) return 'suspect';
  return 'critical';
}

export const FRAUD_SIGNALS = {
  mechanicalRepetition: {
    type: 'action_frequency' as const,
    weight: 15,
    description: 'Activité mécanique et répétée',
  },
  vixupointsSpike: {
    type: 'vixupoints_spike' as const,
    weight: 25,
    description: 'Accumulation anormale de VIXUpoints en peu de temps',
  },
  multiAccountCluster: {
    type: 'multi_account' as const,
    weight: 30,
    description: 'Plusieurs comptes liés détectés',
  },
  contentManipulation: {
    type: 'content_manipulation' as const,
    weight: 20,
    description: 'Soutien anormal à un contenu',
  },
  paymentAnomaly: {
    type: 'payment_anomaly' as const,
    weight: 25,
    description: 'Activité financière suspecte',
  },
  vpnDetected: {
    type: 'vpn_detected' as const,
    weight: 10,
    description: 'Connexion via VPN/Proxy détectée',
  },
} as const;

export interface MultiAccountCluster {
  accountIds: string[];
  suspicionLevel: number; // 0-100
  commonFactors: string[]; // device, IP, payment, phone, etc.
}

export interface VixupointsIntegrityAlert {
  userId: string;
  pointsEarned: number;
  timeframeMinutes: number;
  expectedRange: [number, number];
  anomalyRatio: number; // actual / expected
  possibleFraudMethods: string[];
}
