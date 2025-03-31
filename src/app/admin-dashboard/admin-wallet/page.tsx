"use client";

import { useState, ChangeEvent, FormEvent } from "react";

interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal";
  date: string;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(1000);
  const [amount, setAmount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleWithdraw = (e: FormEvent) => {
    e.preventDefault();
    if (amount > 0 && amount <= balance) {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount,
        type: "withdrawal",
        date: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);
      setBalance(balance - amount);
      setAmount(0);
    } else {
      alert("Invalid withdrawal amount");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Wallet</h2>
      <p className="mb-2">Balance: ${balance}</p>
      <form onSubmit={handleWithdraw}>
        <input
          type="number"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter amount"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Withdraw
        </button>
      </form>
      <h3 className="text-lg font-bold mt-4">Transaction History</h3>
      <ul className="mt-2">
        {transactions.map((tx) => (
          <li key={tx.id} className="border-b p-2">
            {tx.type} - ${tx.amount} on {new Date(tx.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wallet;
