"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/');
    }
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
  };

  const handleSave = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      await fetchUsers();
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (status === 'loading' || loading) return <div>Loading...</div>;
  if (status === 'unauthenticated') return null;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              ユーザー一覧
            </h2>
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="border p-4 rounded">
                  {editingId === user.id ? (
                    <div>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border p-2 mr-2"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="border p-2 mr-2"
                        placeholder="Email"
                      />
                      <button onClick={() => handleSave(user.id)} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">保存</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-4 py-2 rounded">キャンセル</button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p>Email: {user.email}</p>
                      <p>作成日: {new Date(user.createdAt).toLocaleString()}</p>
                      <p>更新日: {new Date(user.updatedAt).toLocaleString()}</p>
                      <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">編集</button>
                      <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-4 py-2 rounded">削除</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}