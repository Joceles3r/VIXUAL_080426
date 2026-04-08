"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  MessageSquare,
  Filter,
  Search,
  Bot,
  Send,
  ArrowRight,
  XCircle,
  Eye,
  UserCog,
} from "lucide-react"
import { MOCK_EMPLOYEES, EMPLOYEE_ROLES } from "@/lib/admin/employees"
import { MESSAGE_CATEGORIES, MESSAGE_PRIORITIES, type SupportMessage } from "@/lib/support/ai-support-engine"

// ==================== MOCK DATA ====================

const MOCK_MESSAGES: SupportMessage[] = [
  {
    id: "msg-001",
    userId: "user-123",
    category: "payment",
    priority: "urgent",
    subject: "Paiement bloque depuis 3 jours",
    body: "Bonjour, mon paiement de 150EUR est bloque depuis 3 jours. Stripe m'indique une erreur mais je ne comprends pas. Pouvez-vous m'aider ?",
    status: "new",
    aiConfidence: 0.92,
    aiAutoReplied: false,
    createdAt: new Date("2026-04-05T10:30:00"),
    updatedAt: new Date("2026-04-05T10:30:00"),
  },
  {
    id: "msg-002",
    userId: "user-456",
    category: "account",
    priority: "important",
    subject: "Impossible de changer mon profil",
    body: "Je souhaite passer de Visiteur a Contributeur mais le bouton ne fonctionne pas. J'ai essaye plusieurs fois.",
    status: "in_progress",
    assignedEmployeeId: "emp-003",
    aiConfidence: 0.85,
    aiAutoReplied: false,
    createdAt: new Date("2026-04-05T09:15:00"),
    updatedAt: new Date("2026-04-05T11:00:00"),
  },
  {
    id: "msg-003",
    userId: "user-789",
    category: "general",
    priority: "normal",
    subject: "Comment fonctionne le Ticket Gold ?",
    body: "Bonjour, je voudrais comprendre comment fonctionne le Ticket Gold et si c'est interessant pour mon projet.",
    status: "resolved",
    assignedEmployeeId: "emp-003",
    aiConfidence: 0.95,
    aiAutoReplied: true,
    createdAt: new Date("2026-04-04T14:20:00"),
    updatedAt: new Date("2026-04-04T14:21:00"),
  },
  {
    id: "msg-004",
    userId: "user-321",
    category: "content",
    priority: "important",
    subject: "Signalement contenu inapproprie",
    body: "Je signale la video ID-V456 qui contient des propos discriminatoires. Merci de verifier rapidement.",
    status: "new",
    aiConfidence: 0.88,
    aiAutoReplied: false,
    createdAt: new Date("2026-04-05T08:45:00"),
    updatedAt: new Date("2026-04-05T08:45:00"),
  },
  {
    id: "msg-005",
    userId: "user-654",
    category: "technical",
    priority: "normal",
    subject: "Bug upload video",
    body: "Quand j'essaie d'uploader une video de plus de 500Mo, la page se bloque. Navigateur Chrome derniere version.",
    status: "in_progress",
    assignedEmployeeId: "emp-004",
    aiConfidence: 0.78,
    aiAutoReplied: false,
    createdAt: new Date("2026-04-05T07:30:00"),
    updatedAt: new Date("2026-04-05T10:00:00"),
  },
  {
    id: "msg-006",
    userId: "user-987",
    category: "stripe_onboarding",
    priority: "normal",
    subject: "Aide activation Stripe",
    body: "Je ne comprends pas comment activer mon compte Stripe. Quels documents dois-je fournir ?",
    status: "new",
    aiConfidence: 0.94,
    aiAutoReplied: true,
    createdAt: new Date("2026-04-05T06:00:00"),
    updatedAt: new Date("2026-04-05T06:01:00"),
  },
  {
    id: "msg-007",
    userId: "user-111",
    category: "abuse",
    priority: "urgent",
    subject: "Suspicion de fraude",
    body: "Je pense qu'un utilisateur cree plusieurs comptes pour voter artificiellement. Pseudo: FakeUser123",
    status: "new",
    aiConfidence: 0.82,
    aiAutoReplied: false,
    createdAt: new Date("2026-04-05T11:00:00"),
    updatedAt: new Date("2026-04-05T11:00:00"),
  },
]

// ==================== COMPONENTS ====================

function MessageRow({ 
  message, 
  onAssign,
  onView,
  onResolve,
}: { 
  message: SupportMessage
  onAssign: () => void
  onView: () => void
  onResolve: () => void
}) {
  const categoryConfig = MESSAGE_CATEGORIES[message.category]
  const priorityConfig = MESSAGE_PRIORITIES[message.priority]
  const assignedEmployee = message.assignedEmployeeId 
    ? MOCK_EMPLOYEES.find(e => e.id === message.assignedEmployeeId)
    : null

  const priorityColors: Record<string, string> = {
    urgent: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    important: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    normal: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    low: "bg-white/10 text-white/50 border-white/20",
  }

  const statusColors: Record<string, string> = {
    new: "bg-violet-500/20 text-violet-400",
    in_progress: "bg-sky-500/20 text-sky-400",
    waiting_user: "bg-amber-500/20 text-amber-400",
    resolved: "bg-emerald-500/20 text-emerald-400",
    closed: "bg-white/10 text-white/50",
  }

  const statusLabels: Record<string, string> = {
    new: "Nouveau",
    in_progress: "En cours",
    waiting_user: "Attente user",
    resolved: "Resolu",
    closed: "Ferme",
  }

  return (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Priority indicator */}
        <div className="flex items-center gap-3">
          <Badge className={`${priorityColors[message.priority]} border`}>
            {priorityConfig.label}
          </Badge>
          <Badge className={statusColors[message.status]}>
            {statusLabels[message.status]}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium truncate">{message.subject}</span>
            {message.aiAutoReplied && (
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                <Bot className="h-3 w-3 mr-1" />
                IA
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {message.userId}
            </span>
            <span>{categoryConfig?.label}</span>
            <span>{message.createdAt.toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        {/* Assigned to */}
        <div className="flex items-center gap-2 min-w-[150px]">
          {assignedEmployee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs text-sky-400">
                {assignedEmployee.firstName[0]}{assignedEmployee.lastName[0]}
              </div>
              <span className="text-white/70 text-sm truncate">
                {assignedEmployee.firstName}
              </span>
            </div>
          ) : (
            <span className="text-white/40 text-sm">Non assigne</span>
          )}
        </div>

        {/* AI Confidence */}
        <div className="w-20 text-center">
          <div className="text-xs text-white/40 mb-1">Confiance IA</div>
          <div className={`text-sm font-medium ${message.aiConfidence > 0.9 ? "text-emerald-400" : message.aiConfidence > 0.8 ? "text-amber-400" : "text-rose-400"}`}>
            {Math.round(message.aiConfidence * 100)}%
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-white" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-sky-400" onClick={onAssign}>
            <UserCog className="h-4 w-4" />
          </Button>
          {message.status !== "resolved" && message.status !== "closed" && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-emerald-400" onClick={onResolve}>
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function AssignModal({
  isOpen,
  onClose,
  onAssign,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onAssign: (employeeId: string) => void
  message: SupportMessage | null
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  if (!isOpen || !message) return null

  const availableEmployees = MOCK_EMPLOYEES.filter(e => 
    e.status === "active" && e.role !== "admin_patron"
  )

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-amber-500/30 w-full max-w-md">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <UserCog className="h-5 w-5 text-amber-400" />
            Assigner le ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-white/60 text-sm mb-4">
            Ticket: <span className="text-white">{message.subject}</span>
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableEmployees.map((emp) => (
              <label
                key={emp.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedEmployee === emp.id 
                    ? "bg-amber-500/20 border border-amber-500/30" 
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name="employee"
                  value={emp.id}
                  checked={selectedEmployee === emp.id}
                  onChange={() => setSelectedEmployee(emp.id)}
                  className="sr-only"
                />
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sm text-sky-400">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                  <p className="text-white/50 text-xs">{EMPLOYEE_ROLES[emp.role]?.label}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/20 text-white">
              Annuler
            </Button>
            <Button 
              onClick={() => {
                if (selectedEmployee) {
                  onAssign(selectedEmployee)
                  onClose()
                }
              }}
              disabled={!selectedEmployee}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
            >
              Assigner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== MAIN PAGE ====================

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>(MOCK_MESSAGES)
  const [activeTab, setActiveTab] = useState<"all" | "urgent" | "important" | "normal" | "resolved">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "urgent") return matchesSearch && msg.priority === "urgent"
    if (activeTab === "important") return matchesSearch && msg.priority === "important"
    if (activeTab === "normal") return matchesSearch && msg.priority === "normal"
    if (activeTab === "resolved") return matchesSearch && (msg.status === "resolved" || msg.status === "closed")
    return matchesSearch
  })

  // Stats
  const urgentCount = messages.filter(m => m.priority === "urgent" && m.status !== "resolved" && m.status !== "closed").length
  const importantCount = messages.filter(m => m.priority === "important" && m.status !== "resolved" && m.status !== "closed").length
  const normalCount = messages.filter(m => m.priority === "normal" && m.status !== "resolved" && m.status !== "closed").length
  const autoRepliedCount = messages.filter(m => m.aiAutoReplied).length

  const handleAssign = (employeeId: string) => {
    if (selectedMessage) {
      setMessages(messages.map(m => 
        m.id === selectedMessage.id 
          ? { ...m, assignedEmployeeId: employeeId, status: "in_progress" as const }
          : m
      ))
    }
  }

  const handleResolve = (messageId: string) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, status: "resolved" as const } : m
    ))
  }

  const tabs = [
    { id: "all", label: "Tous", count: messages.filter(m => m.status !== "resolved" && m.status !== "closed").length },
    { id: "urgent", label: "Urgent", count: urgentCount, color: "text-rose-400" },
    { id: "important", label: "Important", count: importantCount, color: "text-amber-400" },
    { id: "normal", label: "Normal", count: normalCount, color: "text-sky-400" },
    { id: "resolved", label: "Resolus", count: messages.filter(m => m.status === "resolved" || m.status === "closed").length, color: "text-emerald-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Mail className="h-7 w-7 text-amber-400" />
          Messages Support
        </h1>
        <p className="text-white/60 mt-1">Boite de reception intelligente VIXUAL</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
            <div>
              <p className="text-2xl font-bold text-rose-400">{urgentCount}</p>
              <p className="text-white/50 text-xs">Urgents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-amber-400">{importantCount}</p>
              <p className="text-white/50 text-xs">Importants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-sky-500/10 border-sky-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-sky-400" />
            <div>
              <p className="text-2xl font-bold text-sky-400">{normalCount}</p>
              <p className="text-white/50 text-xs">Normaux</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Bot className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{autoRepliedCount}</p>
              <p className="text-white/50 text-xs">Auto-traites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 ${tab.color || "text-white/40"}`}>({tab.count})</span>
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            onAssign={() => {
              setSelectedMessage(message)
              setShowAssignModal(true)
            }}
            onView={() => setSelectedMessage(message)}
            onResolve={() => handleResolve(message.id)}
          />
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Aucun message trouve</p>
          </CardContent>
        </Card>
      )}

      {/* Assign Modal */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        message={selectedMessage}
      />
    </div>
  )
}
