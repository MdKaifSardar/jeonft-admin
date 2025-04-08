import mongoose from "mongoose";

const adminWalletSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // new field
  walletNetwork: { type: String, required: true }, // new field
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdminWallet || mongoose.model("AdminWallet", adminWalletSchema);
