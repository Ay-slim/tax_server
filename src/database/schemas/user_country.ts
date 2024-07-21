import * as mongoose from 'mongoose';

export const UserCountry = new mongoose.Schema(
  {
    user_id: mongoose.Types.ObjectId,
    country_id: mongoose.Types.ObjectId,
    contributions: [
      {
        name: String,
        percentage: Number,
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
