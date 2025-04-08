"use client"

import React from "react";
import DepositComponent from "@/components/DepositComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DepositsPage = () => {
  return (
    <>
      <DepositComponent />
      <ToastContainer />
    </>
  );
};

export default DepositsPage;