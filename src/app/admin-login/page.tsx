"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/admin-dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 border-t-4 border-blue-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">NFT Admin Portal</h2>
          <p className="text-blue-600 text-sm mt-1">
            Secure access to marketplace management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-blue-900 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium shadow-md"
            >
              Sign In
            </button>
          </div>

          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
