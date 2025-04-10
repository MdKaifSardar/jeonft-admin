import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdraw extends Document {
  amount: number; // accepts floating point numbers
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  adminWalletAddress: string;
  state: "pending" | "completed" | "failed";
  depositId: mongoose.Types.ObjectId;
  unit: "eth" | "rs"; // Add unit field
  createdAt: Date;
}

const WithdrawSchema = new Schema<IWithdraw>({
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  adminWalletAddress: { type: String, required: true },
  state: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  depositId: { type: Schema.Types.ObjectId, ref: 'Deposit', required: true },
  unit: { type: String, enum: ["eth", "rs"], required: true }, // Add unit field
  createdAt: { type: Date, default: Date.now }
});

const Withdraw: Model<IWithdraw> = mongoose.models.Withdraw || mongoose.model<IWithdraw>("Withdraw", WithdrawSchema);

export default Withdraw;