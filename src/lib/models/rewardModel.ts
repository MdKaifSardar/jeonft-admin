import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReward extends Document {
  _id: string;
  amount: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  status: "pending" | "received";
}

const RewardSchema = new Schema<IReward>({
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "received"], default: "pending" }
});

const Reward: Model<IReward> = mongoose.models.Reward || mongoose.model<IReward>("Reward", RewardSchema);

export default Reward;
