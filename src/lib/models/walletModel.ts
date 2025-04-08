import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId; // Links the wallet to a user
  address: string; // Wallet address
  balance: number; // Wallet balance in ETH or other currency
  network: string; // Network name (e.g., Ethereum, Binance Smart Chain)
  createdAt: Date; // Timestamp for wallet creation
  updatedAt: Date; // Timestamp for last wallet update
  networks: {
    ethereum?: {
      balance: number;
      address: string;
    };
    polygon?: {
      balance: number;
      address: string;
    };
  };
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  address: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  network: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  networks: {
    ethereum: {
      balance: { type: Number, default: 0 },
      address: { type: String },
    },
    polygon: {
      balance: { type: Number, default: 0 },
      address: { type: String },
    },
  },
});

const Wallet: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);

export default Wallet;
