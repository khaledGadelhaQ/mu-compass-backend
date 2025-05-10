import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/common/enums/roles.enum';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User> & {
  createResetPasswordToken: () => string;
};

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: [true, 'Name is required'] })
  name: string;

  @Prop({
    required: [true, 'Email is required'],
    unique: true,
    match: [/^[\w-\.]+@std\.mans\.edu\.eg$/, 'Must be a valid university email (@std.mans.edu.eg)'],
  })
  email: string;

  @Prop({
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Exclude password from query results by default
  })
  password: string;

  @Prop({ type: String, default: 'default.image.jpeg' })
  profileImage: string;

  @Prop({ type: String, enum: Role, default: Role.Student })
  role: Role;

  @Prop({ type: Boolean, default: true })
  active: Boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: Boolean;

  @Prop({ type: String, default: undefined })
  passwordResetToken?: string;

  @Prop({ type: Date, default: undefined })
  passwordResetExpires?: Date;

  @Prop({ type: String, default: undefined })
  verificationOtp?: string;
 
  @Prop({ type: Date, default: undefined })
  verificationOtpExpires?: Date;
}

const UserSchema = SchemaFactory.createForClass(User);

// Create a text index for name and email fields
UserSchema.index({ name: 'text', email: 'text' });

UserSchema.methods.createResetPasswordToken =
  async function (): Promise<string> {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // Set the token expiration time ( 10 minutes from now)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await this.save();
    return resetToken;
  };

UserSchema.pre<UserDocument>('save', async function (next) {
  try {
    const user = this as UserDocument;
    if (!user.isModified('password')) return next();

    const SALT_ROUNDS = 13;
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);

    next();
  } catch (error) {
    throw new Error(error.message);
  }
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;

  // Hash password if it's being updated
  if (update.password) {
    const SALT_ROUNDS = 13;
    update.password = await bcrypt.hash(update.password, SALT_ROUNDS);
  }

  next();
});

export { UserSchema };
