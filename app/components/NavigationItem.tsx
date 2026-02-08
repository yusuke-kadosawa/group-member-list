"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItemProps {
  title: string
  description: string
  href: string
  disabled?: boolean // disabled プロパティを追加
}

const NavigationItem: React.FC<NavigationItemProps> = ({ title, description, href, disabled }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div
      className={`block px-4 py-3 rounded-md transition-all shadow-md ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : isActive
          ? "bg-blue-500 text-white"
          : "bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
      }`}
    >
      {disabled ? (
        <div>
          <h3 className="text-base font-medium text-gray-500">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      ) : (
        <Link href={href} className="block">
          <div>
            <h3 className={`text-base font-medium ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}>{title}</h3>
            <p className={`text-sm ${isActive ? "text-gray-200" : "text-gray-600 dark:text-gray-400"}`}>{description}</p>
          </div>
        </Link>
      )}
    </div>
  );
};

export default NavigationItem