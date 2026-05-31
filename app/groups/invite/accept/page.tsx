"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GroupInviteAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<'loading'|'success'|'already'|'invalid'|'error'>('loading');
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    // 1. 認証済みかチェック
    fetch("/api/auth/session").then(async (res) => {
      if (res.ok) {
        const session = await res.json();
        if (!session?.user) {
          // 未ログインならマジックリンク認証APIを叩く
          window.location.href = `/auth/verify?token=${encodeURIComponent(token)}`;
          return;
        }
        // 2. グループ参加API呼び出し
        fetch("/api/groups/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }).then(async (res2) => {
          if (res2.ok) {
            const data = await res2.json();
            // グループ名取得
            fetch(`/api/groups/${data.groupId}`).then(async (gRes) => {
              if (gRes.ok) {
                const g = await gRes.json();
                setGroupName(g.name || "グループ");
              }
            });
            setStatus('success');
            setTimeout(() => {
              router.replace(`/?joinedGroup=${encodeURIComponent(groupName)}`);
            }, 1500);
          } else {
            const err = await res2.json();
            if (err.error === 'already joined') {
              setStatus('already');
            } else if (err.error === 'invalid or expired token') {
              setStatus('invalid');
            } else {
              setStatus('error');
            }
          }
        });
      }
    });
  }, [token, router, groupName]);

  if (status === 'loading') return <div>グループ参加処理中...</div>;
  if (status === 'success') return <div>{groupName} へ参加しました。リダイレクト中...</div>;
  if (status === 'already') return <div>すでに参加済みです。</div>;
  if (status === 'invalid') return <div>この招待リンクは無効または期限切れです。</div>;
  return <div>エラーが発生しました。</div>;
}
