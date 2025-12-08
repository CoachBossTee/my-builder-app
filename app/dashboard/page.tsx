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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
    setSuccessMsg(null);
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
      setSuccessMsg('Project added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setNewName('');
  }

  async function handleSaveEdit(id: number) {
    if (!editingName.trim()) return;
    setErrorMsg(null);
    setSuccessMsg(null);

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
      setSuccessMsg('Project updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }

    setEditingId(null);
    setEditingName('');
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    setSuccessMsg('Project deleted successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  if (checking) {
    return (
      <main>
        <h1>Dashboard</h1>
        <div className="loading-container">
          <div className="loading"></div>
          <span>Loading your projects...</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Dashboard</h1>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <form onSubmit={handleAddProject}>
        <input
          type="text"
          placeholder="New project name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button type="submit">Add project</button>
      </form>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to get started!</p>
        </div>
      ) : (
        <>
          <p>Projects: {projects.length}</p>
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
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
