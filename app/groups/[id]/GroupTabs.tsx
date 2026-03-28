"use client";
import React, { useState } from "react";

interface GroupTabsProps {
  membersTab: React.ReactNode;
  invitesTab: React.ReactNode;
  activitiesTab: React.ReactNode;
}

const TABS = [
  { key: "members", label: "メンバー一覧" },
  { key: "invites", label: "招待中" },
  { key: "activities", label: "活動一覧" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function GroupTabs({ membersTab, invitesTab, activitiesTab }: GroupTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("members");

  const content: Record<TabKey, React.ReactNode> = {
    members: membersTab,
    invites: invitesTab,
    activities: activitiesTab,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-4">
        <nav className="flex gap-4 border-b pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? "px-3 py-1 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 font-semibold"
                  : "px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{content[activeTab]}</div>
    </div>
  );
}
