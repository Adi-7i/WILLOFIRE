import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * UserDocument — the Mongoose document type.
 * Exported so AuthService can type its MongoDB return values correctly.
 */
export type UserDocument = HydratedDocument<User>;

/**
 * User schema
 *
 * Design decisions:
 *  - `email` is indexed + unique: enforced at the DB level, not just app level
 *  - `passwordHash` is stored, NEVER the plain password
 *  - `refreshTokenHash` stores a bcrypt hash of the latest refresh token.
 *    Storing a hash (not the raw token) means a DB leak doesn't expose
 *    live tokens. Set to null on logout to invalidate the session.
 *  - `timestamps: true` adds createdAt/updatedAt automatically
 */
@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  /**
   * Hashed refresh token — null when logged out or on first registration
   * before first login. Updated on every token refresh cycle.
   *
   * type: String is explicit because Mongoose cannot reflect union types
   * (string | null) via TypeScript metadata — it requires explicit declaration.
   */
  @Prop({ type: String, default: null })
  refreshTokenHash!: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * Ensure passwordHash is NEVER serialized to JSON.
 * This is a safety net — if a controller accidentally returns the raw User
 * document, the hash will not appear in the response.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    // Removing sensitive fields from every JSON response.
    // This runs automatically when mongoose documents are serialized.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ret.passwordHash = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ret.refreshTokenHash = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ret.__v = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ret;
  },
});
