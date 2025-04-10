import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeposit extends Document {
  amount: number; // accepts floating point numbers
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  adminWalletAddress: string;
  state: "pending" | "completed" | "failed";
  withdrawn: boolean;
  unit: "eth" | "rs";
  createdAt: Date;
}

const DepositSchema = new Schema<IDeposit>({
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  adminWalletAddress: { type: String, required: true },
  state: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  withdrawn: { type: Boolean, default: false }, // Add withdrawn field
  unit: { type: String, enum: ["eth", "rs"], required: true }, // Add unit field
  createdAt: { type: Date, default: Date.now }
});

const Deposit: Model<IDeposit> = mongoose.models.Deposit || mongoose.model<IDeposit>("Deposit", DepositSchema);

export default Deposit;