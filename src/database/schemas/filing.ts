import * as mongoose from 'mongoose';

export const Filing = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    description: String,
    category: {
      type: String,
      enum: ['regular_income', 'capital_gain', 'investment_income'],
      default: 'regular_income',
    },
    amount: Number,
    contributions: [String],
    date: Date,
    country_id: mongoose.Types.ObjectId,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
