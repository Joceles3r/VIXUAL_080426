'use client';

import { useState } from 'react';
import { UserPlus, Users, AlertCircle } from 'lucide-react';

export default function AdminRolesPage() {
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin_adjoint' | 'moderator' | 'support'>('admin_adjoint');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const subordinateRoles = [
    {
      id: 'admin_adjoint',
      name: 'ADMIN-ADJOINT',
      description: 'Gestion opérationnelle avancée',
      permissions: [
        'Suspendre comptes',
        'Bloquer contenus',
        'Geler gains',
        'Geler VIXUpoints',
        'Forcer vérification',
        'Accès logs complets',
      ],
      restrictions: [
        '✖ Ne peut pas modifier les règles',
        '✖ Ne peut pas supprimer définitivement',
        '✖ Ne peut pas accéder à Stripe',
      ],
      requiresTwoFA: true,
      color: 'orange',
    },
    {
      id: 'moderator',
      name: 'MODÉRATEUR',
      description: 'Surveillance et modération',
      permissions: [
        'Bloquer contenus',
        'Masquer contenus',
        'Envoyer avertissements',
        'Signaler fraudes',
        'Accès logs partiels',
      ],
      restrictions: [
        '✖ Ne peut pas suspendre comptes',
        '✖ Ne peut pas bloquer finances',
        '✖ Pas d\'accès financier',
      ],
      requiresTwoFA: false,
      color: 'amber',
    },
    {
      id: 'support',
      name: 'SUPPORT',
      description: 'Assistance utilisateurs',
      permissions: [
        'Répondre aux tickets',
        'Orienter utilisateurs',
        'Signaler problèmes',
        'Logs support seulement',
      ],
      restrictions: [
        '✖ Pas d\'actions administratives',
        '✖ Pas d\'accès sécurité',
      ],
      requiresTwoFA: false,
      color: 'sky',
    },
  ];

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // NOTE V2: Call API to create subordinate admin
    console.log(`Creating ${selectedRole}: ${name} (${email})`);
    
    setEmail('');
    setName('');
    setShowNewRoleForm(false);
    alert('Rôle créé avec succès');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des rôles subordonnés</h1>
          <p className="text-white/60">Créez et gérez les 3 rôles administratifs sous le PATRON</p>
        </div>

        {/* Create New Role Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewRoleForm(!showNewRoleForm)}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            Créer un nouveau rôle
          </button>
        </div>

        {/* Create Role Form */}
        {showNewRoleForm && (
          <div className="bg-slate-900 border border-red-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Créer un nouveau rôle administratif</h2>
            
            <form onSubmit={handleCreateRole} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3">Sélectionner le rôle</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subordinateRoles.map((role) => (
                    <label
                      key={role.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? `border-${role.color}-500 bg-${role.color}-500/10`
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={selectedRole === role.id}
                        onChange={(e) => setSelectedRole(e.target.value as any)}
                        className="mb-2"
                      />
                      <div className="font-semibold">{role.name}</div>
                      <div className="text-sm text-white/60">{role.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-white/40 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@vixual.fr"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-white/40 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* 2FA Note for ADMIN-ADJOINT */}
              {selectedRole === 'admin_adjoint' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-200">
                    <strong>Important :</strong> 2FA (authentification à deux facteurs) sera obligatoire pour ce rôle.
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold transition-colors"
                >
                  Créer le rôle
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewRoleForm(false)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Roles Overview */}
        <div className="space-y-6">
          {subordinateRoles.map((role) => (
            <div key={role.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{role.name}</h3>
                  <p className="text-white/60">{role.description}</p>
                </div>
                {role.requiresTwoFA && (
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-amber-300 text-sm font-semibold">
                    2FA Requis
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-3">Autorisé</h4>
                  <ul className="space-y-2 text-sm">
                    {role.permissions.map((perm, idx) => (
                      <li key={idx} className="text-white/70 flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-3">Interdit</h4>
                  <ul className="space-y-2 text-sm">
                    {role.restrictions.map((restriction, idx) => (
                      <li key={idx} className="text-white/70">
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Subordinates Section */}
        <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rôles actifs
          </h2>
          <div className="text-white/60 text-center py-8">
            Aucun rôle subordonné créé pour le moment.
          </div>
        </div>
      </div>
    </div>
  );
}
