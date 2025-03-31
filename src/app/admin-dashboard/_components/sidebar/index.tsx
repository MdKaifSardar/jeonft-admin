"use client";
import React, { useState, JSX } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Icons (simplified SVG)
const UserIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    ></path>
  </svg>
);

const WalletIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    ></path>
  </svg>
);

const RevenueIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    ></path>
  </svg>
);

const NFTIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    ></path>
  </svg>
);

const CollectionIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    ></path>
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    ></path>
  </svg>
);

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems = [
    { path: "users", name: "User Management", icon: <UserIcon /> },
    { path: "wallet", name: "Wallet Management", icon: <WalletIcon /> },
    { path: "revenue", name: "Total Revenue", icon: <RevenueIcon /> },
    { path: "nft-upload", name: "NFT Upload", icon: <NFTIcon /> },
    { path: "collection-upload", name: "Collection Upload", icon: <CollectionIcon /> }, // Added Collection Upload
  ];

  const NavItem: React.FC<{
    item: { path: string; name: string; icon: JSX.Element };
  }> = ({ item }) => {
    const isActive =
      pathname === `/admin-dashboard/${item.path}` ||
      (pathname === "/admin-dashboard" && item.path === "users");

    return (
      <li className="mb-2">
        <Link href={`/admin-dashboard/${item.path}`}>
          <div
            className={`flex items-center p-3 rounded-md transition-colors ${
              isActive
                ? "bg-blue-700 text-white"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
          </div>
        </Link>
      </li>
    );
  };

  const handleLogout = () => {
    router.push("/");
  };

  // Get current page title based on route
  const getCurrentPageTitle = () => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return "User Management";
    }

    const currentItem = sidebarItems.find(
      (item) => `/dashboard/${item.path}` === pathname
    );

    return currentItem?.name || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always visible */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-blue-900 to-blue-800 h-screen transition-all duration-300 ease-in-out flex flex-col shadow-xl`}
      >
        <div
          className={`p-5 flex ${
            isCollapsed ? "justify-center" : "justify-between"
          } items-center border-b border-blue-700`}
        >
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white">NFT Admin</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-full hover:bg-blue-700 text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-5">
          <ul>
            {sidebarItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className={`flex items-center p-3 w-full rounded-md transition-colors text-blue-100 hover:bg-blue-700/50 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <span className="mr-3">
              <LogoutIcon />
            </span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
