'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

type Task = {
  id: number;
  title: string;
};

export default function TasksPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    async function load() {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase.from('tasks').select('*');
      if (error) {
        setErrorMsg(error.message);
      } else {
        setTasks(data ?? []);
      }

      setChecking(false);
    }

    load();
  }, [supabase, router]);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!newTitle.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTitle })
      .select();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && data.length > 0) {
      setTasks(prev => [...prev, data[0] as Task]);
    }
    setNewTitle('');
  }

  async function handleSaveEdit(id: number) {
    if (!editingTitle.trim()) return;
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('tasks')
      .update({ title: editingTitle })
      .eq('id', id)
      .select();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && data.length > 0) {
      const updated = data[0] as Task;
      setTasks(prev =>
        prev.map(t => (t.id === id ? updated : t))
      );
    }

    setEditingId(null);
    setEditingTitle('');
  }

  if (checking) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Tasks</h1>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Tasks</h1>

      <form onSubmit={handleAddTask} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="New task title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Add task
        </button>
      </form>

      <p>Tasks loaded: {tasks.length}</p>
      {errorMsg && <p>Error: {errorMsg}</p>}

      {!errorMsg && tasks.length > 0 && (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              {editingId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(task.id)}
                    style={{ marginLeft: 4 }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditingTitle('');
                    }}
                    style={{ marginLeft: 4 }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {task.title}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(task.id);
                      setEditingTitle(task.title);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('tasks')
                        .delete()
                        .eq('id', task.id);

                      if (error) {
                        setErrorMsg(error.message);
                        return;
                      }

                      setTasks(prev =>
                        prev.filter(t => t.id !== task.id)
                      );
                    }}
                    style={{ marginLeft: 4 }}
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
