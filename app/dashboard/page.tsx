'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

type Project = {
  id: number;
  name: string;
  user_id: string;
};

export default function DashboardPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/login');
        return;
      }

      setUserId(userData.user.id);

      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        setErrorMsg(error.message);
      } else {
        setProjects(data ?? []);
      }

      setChecking(false);
    }

    load();
  }, [supabase, router]);

  async function handleAddProject(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!newName.trim() || !userId) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName, user_id: userId })
      .select();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && data.length > 0) {
      setProjects(prev => [...prev, data[0] as Project]);
    }
    setNewName('');
  }

  async function handleSaveEdit(id: number) {
    if (!editingName.trim()) return;
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('projects')
      .update({ name: editingName })
      .eq('id', id)
      .select();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && data.length > 0) {
      const updated = data[0] as Project;
      setProjects(prev =>
        prev.map(p => (p.id === id ? updated : p))
      );
    }

    setEditingId(null);
    setEditingName('');
  }

  if (checking) {
    return (
      <main>
        <h1>Dashboard</h1>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <form onSubmit={handleAddProject}>
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button type="submit">Add project</button>
      </form>

      <p>Projects loaded: {projects.length}</p>
      {errorMsg && <p>Error: {errorMsg}</p>}

      {!errorMsg && projects.length > 0 && (
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              {editingId === project.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(project.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName('');
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {project.name}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(project.id);
                      setEditingName(project.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('projects')
                        .delete()
                        .eq('id', project.id);

                      if (error) {
                        setErrorMsg(error.message);
                        return;
                      }

                      setProjects(prev =>
                        prev.filter(p => p.id !== project.id)
                      );
                    }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
