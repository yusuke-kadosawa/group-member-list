"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InviteModal from "../../components/InviteModal";

const InviteModalWrapper = ({ groupId }: { groupId: number }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.push(`/groups/${groupId}?invited=true`);
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => setOpen(true)}
      >
        招待
      </button>
      <InviteModal isOpen={open} onClose={() => setOpen(false)} groupId={groupId} onSuccess={handleSuccess} />
    </>
  );
};

export default InviteModalWrapper;
