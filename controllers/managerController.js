const authService = require('../services/authService');
const approvalService = require('../services/approvalService');
const userService = require('../services/userService');

async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await authService.validateCredentials(email, password);

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
      return;
    }

    if (!['manager', 'super-admin'].includes(user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: only managers and super admins can sign in'
      });
    }

    const token = authService.generateToken();
    const userInfo = authService.getUserInfo(user);

    res.json({
      status: 'success',
      message: 'Sign in successful',
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function approveReviews(req, res) {
  try {
    const { reviewIds, approved, managerId, notes } = req.body;

    if (!managerId) {
      return res.status(400).json({
        status: 'error',
        message: 'managerId is required'
      });
    }

    const manager = await userService.getUserById(managerId);
    if (!manager || !['manager', 'super-admin'].includes(manager.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to approve reviews'
      });
    }

    const approvals = await approvalService.setReviewApprovals({
      reviewIds,
      approved,
      managerId,
      notes
    });

    res.json({
      status: 'success',
      message: `Reviews ${approved ? 'approved' : 'unapproved'} successfully`,
      approvals
    });
  } catch (error) {
    console.error('Manager approval error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update approvals'
    });
  }
}

async function updatePassword(req, res) {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'userId, currentPassword and newPassword are required' });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Only allow managers and super-admins to use this route for now (consistent with signin)
    if (!['manager', 'super-admin'].includes(user.role)) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to change password here' });
    }

    const result = await userService.updatePassword(userId, currentPassword, newPassword);
    if (!result.success) {
      return res.status(400).json({ status: 'error', message: result.message || 'Failed to update password' });
    }

    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update password' });
  }
}

module.exports = {
  signIn,
  approveReviews,
  updatePassword
};

