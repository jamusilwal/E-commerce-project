import AuthService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Auth Controller — handles authentication HTTP requests
 */

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  const result = await AuthService.register({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
  });

  // Set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.created(res, 'Registration successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  // Set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.ok(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.user.id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  return ApiResponse.ok(res, 'Logged out successfully');
});

// POST /api/auth/refresh-token
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  const result = await AuthService.refreshToken(token);

  // Set new refresh token cookie
  setRefreshTokenCookie(res, result.refreshToken);

  return ApiResponse.ok(res, 'Token refreshed', {
    accessToken: result.accessToken,
  });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const resetToken = await AuthService.forgotPassword(email);

  // In development, return the token for testing
  const responseData = process.env.NODE_ENV === 'development' ? { resetToken } : {};

  return ApiResponse.ok(
    res,
    'If an account exists with that email, a reset link has been sent.',
    responseData
  );
});

// POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await AuthService.resetPassword(token, password);

  return ApiResponse.ok(res, 'Password reset successful. Please login with your new password.');
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);

  return ApiResponse.ok(res, 'Profile fetched', user);
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user.id, req.body);

  return ApiResponse.ok(res, 'Profile updated', user);
});

// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await AuthService.changePassword(req.user.id, currentPassword, newPassword);

  return ApiResponse.ok(res, 'Password changed successfully');
});

/**
 * Helper — set refresh token as secure httpOnly cookie
 */
function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}
