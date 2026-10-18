import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = ["supporter", "creator", "admin"];

const userSchema = new mongoose.Schema(
  {
    display_name: { type: String, required: true, trim: true },
    user_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photo_url: { type: String, default: "" },
    password: { type: String, select: false },
    google_id: { type: String, default: null },
    role: { type: String, enum: ROLES, default: "supporter" },
    credits: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    display_name: this.display_name,
    user_email: this.user_email,
    photo_url: this.photo_url,
    role: this.role,
    credits: this.credits,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export { ROLES };
export default User;
