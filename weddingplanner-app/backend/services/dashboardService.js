const db = require('../config/db');

async function getDashboard(userId) {
  const [[user]] = await db.query(
    'SELECT partner_name_1, partner_name_2, wedding_date FROM users WHERE id = ?',
    [userId]
  );

  const [categories] = await db.query(
    `SELECT c.id, c.name,
       COALESCE(SUM(bi.budget_amount), 0) AS budget_total,
       COALESCE(SUM(bi.actual_amount), 0) AS actual_total,
       COALESCE(SUM(bi.paid_amount), 0) AS paid_total,
       COALESCE(SUM(bi.pending_amount), 0) AS pending_total
     FROM categories c
     LEFT JOIN budget_items bi ON bi.category_id = c.id
     WHERE c.user_id = ?
     GROUP BY c.id, c.name
     ORDER BY c.id`,
    [userId]
  );

  const totals = categories.reduce(
    (acc, c) => ({
      budget: acc.budget + Number(c.budget_total),
      actual: acc.actual + Number(c.actual_total),
      paid: acc.paid + Number(c.paid_total),
      pending: acc.pending + Number(c.pending_total),
    }),
    { budget: 0, actual: 0, paid: 0, pending: 0 }
  );

  let daysUntilWedding = null;
  if (user.wedding_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = new Date(user.wedding_date);
    daysUntilWedding = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));
  }

  return {
    partnerName1: user.partner_name_1,
    partnerName2: user.partner_name_2,
    weddingDate: user.wedding_date,
    daysUntilWedding,
    totals,
    categories,
  };
}

module.exports = { getDashboard };
