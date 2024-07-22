import * as mongoose from 'mongoose';

export const Filing = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    description: String,
    category: String,
    income: Number,
    contributions: [String],
    date: Date,
    country_id: mongoose.Types.ObjectId,
    tax: Number,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
