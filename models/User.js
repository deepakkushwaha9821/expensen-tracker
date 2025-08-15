import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    // prefer passwordHash; keep `password` for legacy docs you already have
    passwordHash: { type: String },
    password: { type: String }, // legacy support only
    age: { type: Number },
  },
  { versionKey: false }
);

export default mongoose.model("User", userSchema, "users");
