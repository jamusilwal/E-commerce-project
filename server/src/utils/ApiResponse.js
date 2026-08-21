/**
 * Standardized API response wrapper.
 * Ensures consistent response structure across all endpoints.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Send the response
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }

  // Factory methods
  static ok(res, message = 'Success', data = null) {
    return new ApiResponse(200, message, data).send(res);
  }

  static created(res, message = 'Created successfully', data = null) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
