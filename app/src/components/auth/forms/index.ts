/**
 * @file src/components/auth/forms/index.ts
 * @purpose Barrel exports for authentication form components
 * @functionality
 * - Exports FormInput for styled form inputs
 * - Exports FormButton for styled submit buttons
 * - Exports LoginForm for user authentication
 * - Exports RegisterForm for user registration
 * - Exports PasswordResetConfirmForm for password reset confirmation
 * @dependencies
 * - ./FormInput
 * - ./FormButton
 * - ./LoginForm
 * - ./RegisterForm
 * - ./PasswordResetConfirmForm
 */

export { default as FormInput } from './FormInput';
export type { FormInputProps } from './FormInput';

export { default as FormButton } from './FormButton';
export type { FormButtonProps } from './FormButton';

export { default as LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';

export { default as RegisterForm } from './RegisterForm';
export type { RegisterFormProps } from './RegisterForm';

export { default as PasswordResetConfirmForm } from './PasswordResetConfirmForm';
export type { PasswordResetConfirmFormProps } from './PasswordResetConfirmForm';
