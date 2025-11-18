const ReviewApproval = require('../models/ReviewApproval');
const userService = require('./userService');

async function setReviewApprovals({ reviewIds, approved, managerId, notes }) {
  const manager = await userService.getUserById(managerId);
  if (!manager || !['manager', 'super-admin'].includes(manager.role)) {
    throw new Error('Invalid manager');
  }

  const operations = reviewIds.map(async (reviewId) => {
    const normalizedReviewId = Number(reviewId);
    const update = {
      reviewId: normalizedReviewId,
      approved,
      approvedBy: manager._id,
      notes: notes || undefined,
      approvedAt: approved ? new Date() : null,
    };

    return ReviewApproval.findOneAndUpdate(
      { reviewId: normalizedReviewId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  });

  return Promise.all(operations);
}

async function getApprovalMap() {
  const approvals = await ReviewApproval.find({});
  const map = {};
  approvals.forEach((approval) => {
    map[approval.reviewId] = approval;
  });
  return map;
}

async function getApprovedReviewIds() {
  const approvals = await ReviewApproval.find({ approved: true });
  return approvals.map((approval) => approval.reviewId);
}

module.exports = {
  setReviewApprovals,
  getApprovalMap,
  getApprovedReviewIds,
};

