"use client"

import React from "react";
import WithdrawComponent from "@/components/withdrawComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WithdrawsPage = () => {
  return (
    <>
      <WithdrawComponent />
      <ToastContainer />
    </>
  );
};

export default WithdrawsPage;