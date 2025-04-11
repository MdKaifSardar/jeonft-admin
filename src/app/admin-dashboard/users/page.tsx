import React from "react";
import UserList from "@/components/UserList";
import { ToastContainer } from "react-toastify";

const UsersPage: React.FC = () => {
  return (
    <div className="w-full h-fit">
      <ToastContainer />
      <UserList />
    </div>
  );
};

export default UsersPage;
