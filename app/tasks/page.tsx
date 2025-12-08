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
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
