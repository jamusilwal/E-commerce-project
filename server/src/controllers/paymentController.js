import PaymentService from '../services/paymentService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Payment Controller
 */

// POST /api/payments/esewa/initiate
export const initiateEsewa = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const formData = await PaymentService.initiateEsewa(orderId);
  return ApiResponse.ok(res, 'eSewa payment initiated', formData);
});

// POST /api/payments/esewa/verify
export const verifyEsewa = asyncHandler(async (req, res) => {
  const { data } = req.body;
  const order = await PaymentService.verifyEsewa(data);
  return ApiResponse.ok(res, 'eSewa payment verified', order);
});

// POST /api/payments/khalti/initiate
export const initiateKhalti = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const result = await PaymentService.initiateKhalti(orderId, req.user);
  return ApiResponse.ok(res, 'Khalti payment initiated', result);
});

// POST /api/payments/khalti/verify
export const verifyKhalti = asyncHandler(async (req, res) => {
  const { pidx, orderId } = req.body;
  const order = await PaymentService.verifyKhalti({ pidx, orderId });
  return ApiResponse.ok(res, 'Khalti payment verified', order);
});

// POST /api/payments/verify-security/:id
// Recomputes SHA-256 hash and verifies RSA signature.
// Optional req.body.tamperData to demonstrate verification failure if data is modified.
export const verifyPaymentSecurity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tamperData } = req.body || {};
  const result = await PaymentService.verifyPaymentSecurity(id, tamperData);
  return ApiResponse.ok(res, 'Payment security verification completed', result);
});
