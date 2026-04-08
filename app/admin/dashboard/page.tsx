'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Users, Lock, BarChart3, Shield, MessageSquare, FileText, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const adminTabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'security', label: 'Security Control Center', icon: Shield },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'content', label: 'Contenus', icon: FileText },
    { id: 'social', label: 'Vixual Social', icon: MessageSquare },
    { id: 'logs', label: 'Logs & Audit', icon: Lock },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-black">VIXUAL Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">ADMIN/PATRON</span>
            <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 hover:bg-red-500/30 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-slate-800 bg-slate-900/30 sticky top-0">
        <div className="container mx-auto px-4 flex gap-8 overflow-x-auto">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Key Metrics */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Alertes ouvertes</div>
                <div className="text-3xl font-bold text-amber-400">23</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Comptes à haut risque</div>
                <div className="text-3xl font-bold text-red-400">7</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Retraits bloqués</div>
                <div className="text-3xl font-bold text-orange-400">5</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">VIXUpoints annulés (24h)</div>
                <div className="text-3xl font-bold text-sky-400">2,847</div>
              </div>
            </div>

            {/* Alert Summary */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-300 mb-2">Alertes critiques détectées</h3>
                  <ul className="space-y-1 text-sm text-white/70">
                    <li>• Cluster multi-comptes: 3 comptes liés (risk score: 87)</li>
                    <li>• VIXUpoints anormaux: user_4521 (+456 points en 12 min)</li>
                    <li>• Retrait suspect: user_2891 demande 2400€ via VPN</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Security Control Center</h2>
            <p className="text-white/60">Détection IA, multi-comptes, VIXUpoints, risques financiers</p>
            {/* Placeholder for detailed security dashboard */}
            <div className="text-white/40 text-center py-12">Section détaillée à venir...</div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
            {/* Placeholder for user management */}
            <div className="text-white/40 text-center py-12">Gestion des utilisateurs à venir...</div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion des contenus</h2>
            {/* Placeholder for content management */}
            <div className="text-white/40 text-center py-12">Gestion des contenus à venir...</div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Vixual Social - Modération</h2>
            {/* Placeholder for social moderation */}
            <div className="text-white/40 text-center py-12">Modération Vixual Social à venir...</div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Logs & Audit Trail</h2>
            {/* Placeholder for logs */}
            <div className="text-white/40 text-center py-12">Logs détaillés à venir...</div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paramètres de sécurité</h2>
            {/* Placeholder for security settings */}
            <div className="text-white/40 text-center py-12">Paramètres de sécurité à venir...</div>
          </div>
        )}
      </main>
    </div>
  );
}
