'use client'

import { useState } from 'react'

interface ProfileManagerProps {
  profiles: string[]
  activeProfile: string
  onSelect: (profile: string) => void
  onProfilesChange: () => Promise<void>
}

function Spinner() {
  return (
    <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
  )
}

export default function ProfileManager({ profiles, activeProfile, onSelect, onProfilesChange }: ProfileManagerProps) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState<string | null>(null)  // profile being created (optimistic)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [renamingProfile, setRenamingProfile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return

    // Optimistically show the new profile immediately
    setNewName('')
    setCreating(false)
    setSavingName(name)

    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      onSelect(name)
      await onProfilesChange()
    }

    setSavingName(null)
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete profile "${name}" and all its data?`)) return

    // Optimistically remove immediately
    setDeletingName(name)
    if (activeProfile === name) onSelect(profiles.find(p => p !== name) || profiles[0])

    await fetch('/api/profiles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    await onProfilesChange()
    setDeletingName(null)
  }

  function startRename(name: string) {
    setRenamingProfile(name)
    setRenameValue(name)
  }

  async function handleRename() {
    if (!renamingProfile || !renameValue.trim() || renameValue.trim() === renamingProfile) {
      setRenamingProfile(null)
      return
    }
    const oldName = renamingProfile
    const newName = renameValue.trim()
    setRenamingProfile(null)

    await fetch('/api/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    })

    if (activeProfile === oldName) onSelect(newName)
    onProfilesChange()
  }

  // Visible profiles: real list minus the one being deleted
  const visibleProfiles = profiles.filter(p => p !== deletingName)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-muted text-sm">Profile:</span>

      {visibleProfiles.map(p => (
        <div key={p} className="flex items-center gap-1">
          {renamingProfile === p ? (
            <input
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenamingProfile(null) }}
              onBlur={handleRename}
              autoFocus
              className="bg-card border border-accent rounded px-2 py-1 text-sm text-white w-28 focus:outline-none"
            />
          ) : (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium border transition-colors ${
                activeProfile === p
                  ? 'bg-accent text-white border-accent'
                  : 'bg-card text-muted hover:text-white border-border'
              }`}
            >
              <button
                onClick={() => onSelect(p)}
                onDoubleClick={() => startRename(p)}
                title="Double-click to rename"
              >
                {p}
              </button>
              {visibleProfiles.length > 1 && (
                <button
                  onClick={() => handleDelete(p)}
                  className={`leading-none hover:text-red-400 transition-colors ${
                    activeProfile === p ? 'text-white/60' : 'text-muted'
                  }`}
                  title="Delete profile"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Optimistic pending profile */}
      {savingName && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded text-sm bg-card border border-border text-muted">
          <Spinner />
          <span>{savingName}</span>
        </div>
      )}

      {creating ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Profile name"
            autoFocus
            className="bg-card border border-border rounded px-2 py-1 text-sm text-white w-32 focus:outline-none focus:border-accent"
          />
          <button onClick={handleCreate} className="text-sm text-accent hover:text-accent-hover">
            Add
          </button>
          <button onClick={() => setCreating(false)} className="text-sm text-muted hover:text-white">
            Cancel
          </button>
        </div>
      ) : (
        !savingName && (
          <button
            onClick={() => setCreating(true)}
            className="px-3 py-1 rounded text-sm border border-dashed border-border text-muted hover:text-white hover:border-accent transition-colors"
          >
            + New Profile
          </button>
        )
      )}
    </div>
  )
}
