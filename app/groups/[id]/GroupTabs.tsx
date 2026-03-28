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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentIndex = TABS.findIndex((tab) => tab.key === activeTab);
    if (currentIndex === -1) {
      return;
    }

    let newIndex = currentIndex;

    if (event.key === "ArrowRight") {
      newIndex = (currentIndex + 1) % TABS.length;
    } else if (event.key === "ArrowLeft") {
      newIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") {
      newIndex = 0;
    } else if (event.key === "End") {
      newIndex = TABS.length - 1;
    }

    const newTab = TABS[newIndex];
    setActiveTab(newTab.key);

    const newTabId = `group-tabs-tab-${newTab.key}`;
    const newTabElement = document.getElementById(newTabId);
    if (newTabElement) {
      newTabElement.focus();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-4">
        <nav
          className="flex gap-4 border-b pb-2"
          role="tablist"
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tabId = `group-tabs-tab-${tab.key}`;
            const panelId = `group-tabs-panel-${tab.key}`;

            return (
              <button
                key={tab.key}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                className={
                  isActive
                    ? "px-3 py-1 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 font-semibold"
                    : "px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div
        id={`group-tabs-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`group-tabs-tab-${activeTab}`}
      >
        {content[activeTab]}
      </div>
    </div>
  );
}
