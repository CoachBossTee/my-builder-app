'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../supabase-provider';

type Task = {
  id: number;
  title: string;
  user_id: string;
};

export default function TasksPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

      setUserId(userData.user.id);

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
    setSuccessMsg(null);
    if (!newTitle.trim() || !userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTitle, user_id: userId })
      .select();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data && data.length > 0) {
      setTasks(prev => [...prev, data[0] as Task]);
      setSuccessMsg('Task added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    setNewTitle('');
  }

  async function handleSaveEdit(id: number) {
    if (!editingTitle.trim()) return;
    setErrorMsg(null);
    setSuccessMsg(null);

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
      setSuccessMsg('Task updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }

    setEditingId(null);
    setEditingTitle('');
  }

  async function handleDelete(id: number) {
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== id));
    setSuccessMsg('Task deleted successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  if (checking) {
    return (
      <main>
        <h1>Tasks</h1>
        <div className="loading-container">
          <div className="loading"></div>
          <span>Loading your tasks...</span>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks</h1>

      {errorMsg && <div className="error">{errorMsg}</div>}
      {successMsg && <div className="success">{successMsg}</div>}

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="New task title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <button type="submit">Add task</button>
      </form>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Add your first task to get started!</p>
        </div>
      ) : (
        <>
          <p>Tasks: {tasks.length}</p>
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
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingTitle('');
                      }}
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
                      onClick={() => handleDelete(task.id)}
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
