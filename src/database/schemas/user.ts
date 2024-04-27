import * as mongoose from 'mongoose';

export const User = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
