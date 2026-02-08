import React from 'react'
import Link from "next/link"

interface ManagementCardProps {
  title: string
  description: string
  href: string
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, description, href }) => {
  if (!href) {
    console.error("ManagementCard: href is required but was not provided.")
    return null
  }
  return (
    <Link href={href} className="block px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
      <h3 className="text-base font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  )
}

export default ManagementCard