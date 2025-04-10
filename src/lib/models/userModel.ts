import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  referralCode?: string;
  userReferralCode: string;
  referralLink: string; // New field for referral link
  walletId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  balance: number;
  lastIncomeUpdate?: Date;
  incomeAmount?: number;
  referralIncome?: number;
  totalBalance?: number;
  ethBalance: number; // New field for ETH balance
  rsBalance: number; // New field for INR balance
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  userReferralCode: { type: String, required: true, unique: true },
  referralLink: { type: String, required: true }, // New field
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  walletAddress: { type: String },
  balance: { type: Number, default: 0 },
  lastIncomeUpdate: { type: Date, default: null },
  incomeAmount: { type: Number, default: 0 },
  referralIncome: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  ethBalance: { type: Number, default: 0 }, // New field
  rsBalance: { type: Number, default: 0 }, // New field
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
