/**
 * VIXUAL - Security Rules & Automated Actions
 * 
 * Règles automatiques pour détection et action sur les risques
 */

export interface SecurityRule {
  id: string;
  name: string;
  condition: string;
  action: SecurityAction;
  enabled: boolean;
  createdAt: Date;
}

export type SecurityAction = 
  | 'freeze_gains'
  | 'freeze_vixupoints'
  | 'block_withdrawals'
  | 'open_investigation'
  | 'suspend_account'
  | 'disable_rewards'
  | 'hide_content'
  | 'force_verification'
  | 'notify_admin';

export interface SecuritySettings {
  // VIXUpoints limits
  dailyVixupointsCap: number;
  weeklyVixupointsCap: number;
  minorVixupointsTotal: number;
  
  // Risk Score thresholds
  autoFreezeThreshold: number;
  autoSuspendThreshold: number;
  autoInvestigationThreshold: number;
  
  // Multi-account detection
  multiAccountSuspicionThreshold: number;
  
  // Withdrawal review
  withdrawalReviewDelayHours: number;
  highValueWithdrawalThreshold: number;
  
  // High-risk countries/regions
  highRiskCountries: string[];
  vpnProxyBlockList: string[];
  
  // Minor protections
  minorDailyLimit: number;
  minorWeeklyLimit: number;
  minorVerificationRequired: boolean;
  
  // Comment spam
  commentSpamThreshold: number; // identical comments within timeframe
  
  // Share manipulation
  shareManipulationThreshold: number; // identical shares within timeframe
}

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  dailyVixupointsCap: 100,
  weeklyVixupointsCap: 500,
  minorVixupointsTotal: 10_000,
  
  autoFreezeThreshold: 80,
  autoSuspendThreshold: 90,
  autoInvestigationThreshold: 75,
  
  multiAccountSuspicionThreshold: 85,
  
  withdrawalReviewDelayHours: 24,
  highValueWithdrawalThreshold: 1000,
  
  highRiskCountries: [],
  vpnProxyBlockList: [],
  
  minorDailyLimit: 100,
  minorWeeklyLimit: 500,
  minorVerificationRequired: true,
  
  commentSpamThreshold: 5, // 5 identical comments = suspicious
  shareManipulationThreshold: 3, // 3 identical shares = suspicious
};

export const DEFAULT_SECURITY_RULES: Omit<SecurityRule, 'id' | 'createdAt'>[] = [
  {
    name: 'Freeze on Critical Risk',
    condition: 'riskScore > 80',
    action: 'freeze_gains',
    enabled: true,
  },
  {
    name: 'Investigate Very High Risk',
    condition: 'riskScore > 75 && multiAccountCluster.suspicionLevel > 80',
    action: 'open_investigation',
    enabled: true,
  },
  {
    name: 'Force Verification for Minors Over Limit',
    condition: 'isMinor && vixupointsEarned > dailyLimit',
    action: 'force_verification',
    enabled: true,
  },
  {
    name: 'Block High-Value Withdrawal from VPN',
    condition: 'withdrawalAmount > 1000 && vpnDetected && accountAgeDays < 30',
    action: 'block_withdrawals',
    enabled: true,
  },
  {
    name: 'Hide Suspicious Content',
    condition: 'contentRiskScore > 85 && unnatural_engagement_spike',
    action: 'hide_content',
    enabled: true,
  },
];

export interface AuditLog {
  id: string;
  adminId: string;
  adminRole: string;
  action: SecurityAction;
  targetUserId?: string;
  targetContentId?: string;
  reason: string;
  result: 'success' | 'failed';
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
}
