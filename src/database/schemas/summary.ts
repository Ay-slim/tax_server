import * as mongoose from 'mongoose';

export const Summary = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    year: Number,
    country_id: mongoose.Types.ObjectId,
    total_taxed_income: Number,
    total_deducted_tax: Number,
    current_tax_index: Number,
    current_tax_bracket: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
