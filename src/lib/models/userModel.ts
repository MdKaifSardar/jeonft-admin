import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  referralCode?: string;
  userReferralCode: string;
  walletId?: mongoose.Types.ObjectId;
  walletAddress?: string;
  balance: number;
  referralAdded?: boolean;
  lastIncomeUpdate?: Date;
  incomeAmount?: number;
  referralIncome?: number; // ✅ NEW
  totalBalance?: number;   // ✅ NEW
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  referralCode: { type: String },
  userReferralCode: { type: String, required: true, unique: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  walletAddress: { type: String },
  balance: { type: Number, default: 0 },
  referralAdded: { type: Boolean, default: false },
  lastIncomeUpdate: { type: Date, default: null },
  incomeAmount: { type: Number, default: 0 },
  referralIncome: { type: Number, default: 0 },  // ✅ NEW
  totalBalance: { type: Number, default: 0 },    // ✅ NEW
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User: Model<IUser> =
  mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
