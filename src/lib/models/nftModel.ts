import mongoose, { Schema, Document, Model } from "mongoose";

export interface INFT extends Document {
  name: string;
  description: string;
  price: number;
  royalty: number;
  collectionName: mongoose.Types.ObjectId;
  image: {
    url: string;
    public_id: string;
  };
}

const NFTSchema = new Schema<INFT>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  royalty: { type: Number, required: true },
  collectionName: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true }, // Updated to reference Collection
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
});

const NFT: Model<INFT> = mongoose.models.NFT || mongoose.model<INFT>("NFT", NFTSchema);

export default NFT;
