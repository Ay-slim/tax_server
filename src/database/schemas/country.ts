import * as mongoose from 'mongoose';

export const Country = new mongoose.Schema(
  {
    name: String,
    currency: String,
    tax_brackets: [
      {
        bracket: String,
        rate: Number,
        limit: Number,
      },
    ],
    possible_contributions: [String],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
