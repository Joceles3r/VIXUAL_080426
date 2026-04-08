"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Activity,
  MoreVertical,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import {
  type Employee,
  type EmployeeRole,
  type EmployeeFunction,
  type EmployeeWorkload,
  EMPLOYEE_ROLES,
  EMPLOYEE_FUNCTIONS,
  MOCK_EMPLOYEES,
  MOCK_WORKLOADS,
  getDefaultPermissionsForRole,
} from "@/lib/admin/employees"

// ==================== COMPONENTS ====================

function EmployeeCard({ 
  employee, 
  workload,
  onEdit,
  onSuspend,
  onView,
}: { 
  employee: Employee
  workload?: EmployeeWorkload
  onEdit: () => void
  onSuspend: () => void
  onView: () => void
}) {
  const roleConfig = EMPLOYEE_ROLES[employee.role]
  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    sky: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  }
  const badgeColor = colorMap[roleConfig.color] || colorMap.sky

  return (
    <Card className="bg-slate-900/50 border-white/10 hover:border-white/20 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${badgeColor.split(" ")[0]}`}>
              <span className="text-lg font-bold">
                {employee.firstName[0]}{employee.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-white/50 text-sm">{employee.email}</p>
            </div>
          </div>
          <Badge className={`${badgeColor} border`}>
            {roleConfig.label}
          </Badge>
        </div>

        {/* Fonctions */}
        <div className="mb-4">
          <p className="text-white/40 text-xs mb-2">Fonctions attribuees</p>
          <div className="flex flex-wrap gap-1">
            {employee.functions.slice(0, 3).map((fn) => (
              <Badge key={fn} variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
                {EMPLOYEE_FUNCTIONS[fn]?.label || fn}
              </Badge>
            ))}
            {employee.functions.length > 3 && (
              <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/50">
                +{employee.functions.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Workload */}
        {workload && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/5 rounded-lg">
            <div className="text-center">
              <p className="text-white font-semibold">{workload.ticketsAssigned}</p>
              <p className="text-white/40 text-xs">Tickets</p>
            </div>
            <div className="text-center">
              <p className={`font-semibold ${workload.urgentTickets > 0 ? "text-rose-400" : "text-white"}`}>
                {workload.urgentTickets}
              </p>
              <p className="text-white/40 text-xs">Urgents</p>
            </div>
            <div className="text-center">
              <p className="text-emerald-400 font-semibold">{workload.todayResolved}</p>
              <p className="text-white/40 text-xs">Resolus</p>
            </div>
          </div>
        )}

        {/* Status & Actions */}
        <div className="flex items-center justify-between">
          <Badge className={employee.status === "active" 
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
          }>
            {employee.status === "active" ? "Actif" : "Suspendu"}
          </Badge>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-white" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-sky-400" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white/50 hover:text-rose-400" onClick={onSuspend}>
              {employee.status === "active" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateEmployeeModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: Partial<Employee>) => void
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<EmployeeRole>("support_agent")
  const [selectedFunctions, setSelectedFunctions] = useState<EmployeeFunction[]>([])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    onCreate({
      firstName,
      lastName,
      email,
      role,
      functions: selectedFunctions,
      permissions: getDefaultPermissionsForRole(role),
      status: "active",
    })
    setFirstName("")
    setLastName("")
    setEmail("")
    setRole("support_agent")
    setSelectedFunctions([])
    onClose()
  }

  const toggleFunction = (fn: EmployeeFunction) => {
    setSelectedFunctions(prev => 
      prev.includes(fn) ? prev.filter(f => f !== fn) : [...prev, fn]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-amber-500/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-400" />
            Creer un employe
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-1 block">Prenom *</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prenom"
                  className="bg-slate-800 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1 block">Nom *</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  className="bg-slate-800 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@vixual.fr"
                className="bg-slate-800 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Role principal</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EmployeeRole)}
                className="w-full p-2 bg-slate-800 border border-white/20 rounded-md text-white"
              >
                {Object.entries(EMPLOYEE_ROLES)
                  .filter(([key]) => key !== "admin_patron")
                  .map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Fonctions attribuees</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-800/50 rounded-lg">
                {Object.entries(EMPLOYEE_FUNCTIONS).map(([key, config]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFunctions.includes(key as EmployeeFunction)}
                      onChange={() => toggleFunction(key as EmployeeFunction)}
                      className="rounded border-white/20"
                    />
                    <span className="text-white/70">{config.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-white/20 text-white">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white">
                Creer l&apos;employe
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== MAIN PAGE ====================

export default function AdminEmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [workloads] = useState<EmployeeWorkload[]>(MOCK_WORKLOADS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<EmployeeRole | "all">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || emp.role === filterRole
    return matchesSearch && matchesRole
  })

  // Stats
  const activeCount = employees.filter(e => e.status === "active").length
  const totalTickets = workloads.reduce((sum, w) => sum + w.ticketsAssigned, 0)
  const urgentTickets = workloads.reduce((sum, w) => sum + w.urgentTickets, 0)

  const handleCreateEmployee = (data: Partial<Employee>) => {
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      userId: `user-${Date.now()}`,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      role: data.role || "support_agent",
      functions: data.functions || [],
      permissions: data.permissions || [],
      status: "active",
      createdBy: user?.id || "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEmployees([...employees, newEmployee])
    alert(`Employe ${newEmployee.firstName} ${newEmployee.lastName} cree avec succes`)
  }

  const handleSuspendEmployee = (employee: Employee) => {
    if (employee.role === "admin_patron") {
      alert("Impossible de suspendre le PATRON")
      return
    }
    const newStatus = employee.status === "active" ? "suspended" : "active"
    setEmployees(employees.map(e => 
      e.id === employee.id ? { ...e, status: newStatus as "active" | "suspended" } : e
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="h-7 w-7 text-amber-400" />
            ADMIN-Adjoint + Employes
          </h1>
          <p className="text-white/60 mt-1">Gerez votre equipe interne VIXUAL</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Creer un employe
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
              <p className="text-white/50 text-xs">Employes actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalTickets}</p>
              <p className="text-white/50 text-xs">Tickets assignes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-400">{urgentTickets}</p>
              <p className="text-white/50 text-xs">Tickets urgents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{employees.length}</p>
              <p className="text-white/50 text-xs">Total equipe</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Rechercher un employe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-white/20 text-white"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as EmployeeRole | "all")}
            className="p-2 bg-slate-800 border border-white/20 rounded-md text-white min-w-[180px]"
          >
            <option value="all">Tous les roles</option>
            {Object.entries(EMPLOYEE_ROLES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <Button variant="outline" className="border-white/20 text-white/70">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            workload={workloads.find(w => w.employeeId === employee.id)}
            onEdit={() => setSelectedEmployee(employee)}
            onSuspend={() => handleSuspendEmployee(employee)}
            onView={() => setSelectedEmployee(employee)}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Aucun employe trouve</p>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateEmployee}
      />
    </div>
  )
}
