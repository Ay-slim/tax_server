import * as mongoose from 'mongoose';

export const Summary = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    year: Number,
    country_id: mongoose.Types.ObjectId,
    total_income: Number,
    total_taxed_income: Number,
    total_deducted_tax: Number,
    current_tax_index: Number,
    current_tax_bracket: String,
    taxes: [
      {
        amount: Number,
        reason: String,
        description: String,
      },
    ],
    deductions: [
      {
        amount: Number,
        reason: String,
        description: String,
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
