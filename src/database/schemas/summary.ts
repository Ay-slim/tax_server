import * as mongoose from 'mongoose';

export const Summary = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    year: Number,
    country_id: mongoose.Types.ObjectId,
    income: Number,
    tax: Number,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
