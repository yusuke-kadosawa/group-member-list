"use client";
import { useEffect, useState } from 'react';

interface Invite {
  identifier: string;
  expires: string;
}

export default function GroupInvitesTab({ groupId }: { groupId: number }) {
  const [invites, setInvites] = useState<Invite[] | null>(null);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/invites`)
      .then(r => r.json())
      .then(data => setInvites(data.invites ?? []))
      .catch(() => setInvites([]));
  }, [groupId]);

  if (invites === null) {
    return <div className="py-4 text-gray-400">Loading...</div>;
  }

  if (invites.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 py-4">
        招待中のメンバーはいません
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
          <th className="pb-2 font-semibold">メールアドレス</th>
          <th className="pb-2 font-semibold">有効期限</th>
        </tr>
      </thead>
      <tbody>
        {invites.map((invite) => (
          <tr key={invite.identifier} className="border-b dark:border-gray-700 last:border-0">
            <td className="py-2 text-gray-900 dark:text-gray-100">{invite.identifier}</td>
            <td className="py-2 text-gray-500 dark:text-gray-400">
              {new Date(invite.expires).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
