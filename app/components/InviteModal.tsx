import React, { useState } from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, groupId }) => {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // カンマ区切り→配列
      const emailArray = emails.split(',').map(e => e.trim()).filter(Boolean);
      const res = await fetch(`/api/groups/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, emails: emailArray, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '招待に失敗しました');
      setSuccess(`${data.count || 1}人に招待メールを送信しました`);
      setEmails('');
      setMessage('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">メンバーを招待</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">メールアドレス（カンマ区切りで複数可）</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mb-3"
            value={emails}
            onChange={e => setEmails(e.target.value)}
            placeholder="example1@mail.com, example2@mail.com"
            required
          />
          <label className="block mb-2 font-semibold">招待メッセージ（任意）</label>
          <textarea
            className="w-full border rounded px-3 py-2 mb-3"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={300}
            placeholder="グループへの招待理由など（300文字以内）"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" disabled={loading}>
              {loading ? '送信中...' : '招待を送信'}
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
