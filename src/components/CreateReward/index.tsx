"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/actions/user.actions";
import {
  createReward,
  getAllRewards,
  deleteReward,
} from "@/lib/actions/reward.actions";
import { toast } from "react-toastify";

type User = {
  _id: string;
  username: string;
};

type Reward = {
  _id: string;
  amount: number;
  user: {
    _id: string;
    username: string;
  };
};

const CreateRewardForm = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);

  const fetchUsers = async () => {
    const result = await getAllUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      toast.error("Failed to fetch users");
    }
  };

  const fetchRewards = async () => {
    const result = await getAllRewards();
    if (result.success && result.data) {
      setRewards(result.data);
    } else {
      toast.error("Failed to fetch rewards");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRewards();
  }, []);

  const handleSubmit = async () => {
    if (!selectedUserId || amount <= 0) {
      toast.error("Please select a user and enter a valid amount");
      return;
    }

    setLoading(true);
    const result = await createReward(selectedUserId, amount);
    setLoading(false);

    if (result.success) {
      toast.success("Reward created successfully!");
      setAmount(0);
      setSelectedUserId("");
      fetchRewards(); // re-fetch rewards after creation
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  const confirmDeleteReward = async () => {
    if (!rewardToDelete) return;

    const result = await deleteReward(rewardToDelete._id);
    if (result.success) {
      toast.success("Reward deleted successfully");
      fetchRewards();
    } else {
      toast.error(result.message || "Failed to delete reward");
    }
    setShowDeleteModal(false);
    setRewardToDelete(null);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md md:w-[70%] w-full mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Create Reward</h2>

      <div>
        <label className="block mb-1 font-medium">Select User</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Reward Amount (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-2"
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Creating..." : "Create Reward"}
      </button>

      <hr className="my-4" />

      <div>
        <h3 className="text-lg font-semibold mb-2">All Rewards</h3>
        {rewards.length === 0 ? (
          <p className="text-gray-500">No rewards found.</p>
        ) : (
          <ul className="space-y-2">
            {rewards.map((reward) => (
              <li
                key={reward._id}
                className="bg-gray-100 p-3 rounded-md shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{reward.user.username}</div>
                  <div className="text-sm text-gray-600">
                    Reward: {reward.amount} ETH
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRewardToDelete(reward);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && rewardToDelete && (
        <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-semibold">Confirm Delete</h3>
            <p>
              Are you sure you want to delete the reward of{" "}
              <span className="font-medium">{rewardToDelete.amount} ETH</span>{" "}
              for user{" "}
              <span className="font-medium">
                {rewardToDelete.user.username}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRewardToDelete(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReward}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRewardForm;
