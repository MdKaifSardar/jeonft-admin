import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  referralCode?: string;
  userReferralCode: string;
  referralLink: string; // Referral link
  walletId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  balance: number; // Main balance field
  lastIncomeUpdate?: Date;
  incomeAmount?: number;
  referralIncome?: number;
  totalBalance?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  userReferralCode: { type: String, required: true, unique: true },
  referralLink: { type: String, required: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  walletAddress: { type: String },
  balance: { type: Number, default: 0 },
  lastIncomeUpdate: { type: Date, default: null },
  incomeAmount: { type: Number, default: 0 },
  referralIncome: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
