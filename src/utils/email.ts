import { getUserEmailById } from '@/modules/auth/auth.services';

/**
 * @TODO Implement email sending.
 * @param params
 */
export const sendEmailVerificationCode = async (userId: string, verificationCode: number) => {
  const email = await getUserEmailById(userId);

  console.log('send email verification code!', {
    email,
    verificationCode,
  });
};

/**
 * Send password reset email.
 *
 * @TODO Implement email sending.
 * @param userId - User ID.
 */
export const sendPasswordResetEmail = async (userId: string, token: string) => {
  const email = await getUserEmailById(userId);

  console.log('send password reset code!', {
    email,
  });
};
