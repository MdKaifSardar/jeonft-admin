import CreateRewardForm from "@/components/CreateReward";
import React from "react";
import { ToastContainer } from "react-toastify";

const page = () => {
  return (
    <div className="flex flex-col w-full">
      <ToastContainer />
      <CreateRewardForm />
    </div>
  );
};

export default page;
