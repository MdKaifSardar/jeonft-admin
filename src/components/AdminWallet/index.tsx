"use client"
import React, { useState } from "react";
import Loader from "../Loader";
import { toast } from "react-toastify";
import { createAdminWallet, deleteAdminWallets } from "@/lib/actions/adminwallet.actions";

const AdminWallet = () => {
  const [walletData, setWalletData] = useState<{
    walletAddress: string;
    walletBalance: number;
    walletNetwork: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      toast.error("MetaMask not found");
      return;
    }
    try {
      setLoading(true);
      // Request wallet connection and retrieve account
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      // Get wallet balance (in ether) and network id
      const balanceWei = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      const balance = parseFloat((parseInt(balanceWei) / 1e18).toFixed(4));
      const networkId = await (window as any).ethereum.request({ method: "net_version" });
      // Map network id to network name
      const networkName =
        networkId === "1" ? "Ethereum Mainnet" :
        networkId === "3" ? "Ropsten" :
        networkId === "4" ? "Rinkeby" :
        networkId === "5" ? "Goerli" :
        networkId === "42" ? "Kovan" :
        "Unknown Network";
      // Call server action to create admin wallet using networkName.
      // If wallet already exists, it returns the existing wallet data.
      const result = await createAdminWallet(account, balance, networkName);
      if (result.success) {
        toast.success(result.message);
        // Convert the returned data to plain object and set connected wallet data
        const plainData = JSON.parse(JSON.stringify(result.data));
        setWalletData({
          walletAddress: plainData.walletAddress,
          walletBalance: plainData.walletBalance,
          walletNetwork: plainData.walletNetwork,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      const result = await deleteAdminWallets();
      if (result.success) {
        toast.success(result.message);
        setWalletData(null);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleConfirmDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Wallet</h2>
      {loading ? (
        <Loader text="Processing..." />
      ) : walletData ? (
        <div className="border p-4 rounded shadow-md">
          <p><strong>Wallet Address:</strong> {walletData.walletAddress}</p>
          <p><strong>Wallet Balance:</strong> {walletData.walletBalance} ETH</p>
          <p><strong>Wallet Network:</strong> {walletData.walletNetwork}</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Disconnect Admin Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect MetaMask as Admin
        </button>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Disconnect</h3>
            <p className="mb-4">Are you sure you want to disconnect the admin wallet?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleConfirmDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWallet;