"use client";
import React, { useState } from "react";
import InviteModal from "../../components/InviteModal";

const InviteModalWrapper = ({ groupId }: { groupId: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => setOpen(true)}
      >
        招待
      </button>
      <InviteModal isOpen={open} onClose={() => setOpen(false)} groupId={groupId} />
    </>
  );
};

export default InviteModalWrapper;
