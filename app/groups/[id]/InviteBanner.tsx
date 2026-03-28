"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface InviteBannerProps {
  groupId: number;
  count: number;
}

const InviteBanner = ({ groupId, count }: InviteBannerProps) => {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 2500);
    const replaceTimer = setTimeout(() => {
      router.replace(`/groups/${groupId}`);
    }, 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(replaceTimer);
    };
  }, [groupId, router]);

  const message =
    count > 0
      ? `${count}人に招待メールを送信しました`
      : "招待メールは送信されませんでした（全員がすでにメンバーまたは招待済みです）";

  return (
    <div
      className={`mb-4 px-4 py-3 rounded-lg transition-opacity duration-500 ${count > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'} ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {message}
    </div>
  );
};

export default InviteBanner;
