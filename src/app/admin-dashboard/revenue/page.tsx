"use client";

import React, { useState, ChangeEvent } from "react";

interface RevenueData {
  day?: string;
  month?: string;
  revenue: number;
}

interface SalesData {
  category: string;
  percentage: number;
  value: number;
}

interface Stat {
  name: string;
  value: string;
  change: string;
  positive: boolean;
}

const Revenue: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("monthly");

  // Sample data for the charts
  const revenueData: { daily: RevenueData[]; monthly: RevenueData[] } = {
    daily: [
      { day: "Mon", revenue: 1800 },
      { day: "Tue", revenue: 2200 },
      { day: "Wed", revenue: 1900 },
      { day: "Thu", revenue: 2400 },
      { day: "Fri", revenue: 2800 },
      { day: "Sat", revenue: 3200 },
      { day: "Sun", revenue: 2600 },
    ],
    monthly: [
      { month: "Jan", revenue: 38000 },
      { month: "Feb", revenue: 42000 },
      { month: "Mar", revenue: 50000 },
      { month: "Apr", revenue: 55000 },
      { month: "May", revenue: 48000 },
      { month: "Jun", revenue: 60000 },
    ],
  };

  const salesData: SalesData[] = [
    { category: "Art", percentage: 40, value: 20000 },
    { category: "Collectibles", percentage: 30, value: 15000 },
    { category: "Photography", percentage: 20, value: 10000 },
    { category: "Virtual Worlds", percentage: 10, value: 5000 },
  ];

  const stats: Stat[] = [
    {
      name: "Total Revenue",
      value: "$150,000",
      change: "+12.5%",
      positive: true,
    },
    { name: "Active NFTs", value: "1,240", change: "+8.3%", positive: true },
    { name: "Average Price", value: "$320", change: "+5.7%", positive: true },
    { name: "Unique Buyers", value: "485", change: "-3.2%", positive: false },
  ];

  const renderChart = () => {
    const data =
      timeframe === "daily" ? revenueData.daily : revenueData.monthly;
    const maxValue = Math.max(...data.map((d) => d.revenue));

    return (
      <div className="h-64 mt-4">
        <div className="flex h-full items-end space-x-2">
          {data.map((item, index) => {
            const height = `${(item.revenue / maxValue) * 100}%`;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full group">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition"
                    style={{ height }}
                  ></div>
                  <div className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 mb-2 transition-opacity">
                    <div className="bg-blue-800 text-white text-xs rounded py-1 px-2 text-center mx-auto w-20">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {timeframe === "daily" ? item.day : item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-blue-600">{stat.name}</div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-semibold text-blue-900">
                {stat.value}
              </div>
              <div
                className={`text-sm font-medium px-2 py-0.5 rounded ${
                  stat.positive
                    ? "text-green-800 bg-green-100"
                    : "text-red-800 bg-red-100"
                }`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-blue-900">
                Revenue Overview
              </h3>
              <p className="text-sm text-blue-600">
                Gross marketplace sales over time
              </p>
            </div>
            <div>
              <select
                value={timeframe}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setTimeframe(e.target.value as "daily" | "monthly")
                }
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="daily">Last 7 Days</option>
                <option value="monthly">Last 6 Months</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">{renderChart()}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-blue-900">
              Sales by Category
            </h3>
            <p className="text-sm text-blue-600">
              Distribution of NFT sales by category
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {salesData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-blue-900">
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-700">
                      ${item.value.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-blue-900">
              Recent Transactions
            </h3>
            <p className="text-sm text-blue-600">
              Latest NFT sales on the marketplace
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-800">
                    NFT
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium text-blue-900">
                        CryptoArt #{Math.floor(Math.random() * 1000) + 1000}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.floor(Math.random() * 3) + 1} hour
                        {Math.floor(Math.random() * 3) + 1 > 1 ? "s" : ""} ago
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="text-sm text-gray-500">
                        0x{Math.random().toString(16).substring(2, 8)}...
                        {Math.random().toString(16).substring(2, 6)}
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        {(Math.random() * 4 + 0.1).toFixed(2)} ETH
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all transactions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
