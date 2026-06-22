const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

async function getDashboard(req, res) {
  const dashboard = await dashboardService.getDashboard(req.session.userId);
  res.json(dashboard);
}

module.exports = { getDashboard: asyncHandler(getDashboard) };
