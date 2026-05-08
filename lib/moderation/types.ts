export type AlertSeverity = "critical" | "important" | "standard" | "info"
export type AlertStatus = "pending" | "approved" | "rejected" | "escalated" | "expired"

export type AlertType =
  | "promotion_pending_l1_l2"
  | "promotion_pending_l2_l3"
  | "trust_score_drop"
  | "fraud_suspicion_payment"
  | "fraud_suspicion_self_support"
  | "rapid_account_creation"
  | "convergent_reports"
  | "velocity_anomaly"
  | "chargeback_received"
  | "dormant_account_burst"
  | "platform_v1_to_v2_ready"
  | "platform_v2_to_v3_ready"
  | "weekly_health_report"

export interface ModerationAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  userId: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  title: string
  description: string
  context: Record<string, unknown> | null
  suggestedAction: string | null
  resolvedBy: string | null
  resolvedAt: Date | null
  resolutionNote: string | null
  emailSent: boolean
  createdAt: Date
  expiresAt: Date | null
}

export interface TrustScoreDelta {
  userId: string
  delta: number
  reason: string
  triggerEvent: string
}

export type ModerationEvent =
  | { kind: "user_signup"; userId: string }
  | { kind: "email_verified"; userId: string }
  | { kind: "phone_verified"; userId: string }
  | { kind: "contribution_success"; userId: string; amount: number }
  | { kind: "contribution_failed"; userId: string }
  | { kind: "publication_success"; userId: string; contentId: string }
  | { kind: "report_received"; targetUserId: string; reporterUserId: string; reason: string }
  | { kind: "chargeback"; userId: string; amount: number }
  | { kind: "comment_posted"; userId: string; commentId: string }
  | { kind: "boost_given"; userId: string }
  | { kind: "boost_received"; userId: string }
  | { kind: "quiz_passed"; userId: string }
  | { kind: "user_active"; userId: string }
