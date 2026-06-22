const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

async function signup(req, res) {
  const { email, password, partnerName1, partnerName2, weddingDate } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const existing = await authService.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = await authService.createUser({ email, password, partnerName1, partnerName2, weddingDate });
  req.session.userId = user.id;
  res.status(201).json({ id: user.id, email: user.email });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await authService.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await authService.verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
}

function me(req, res) {
  res.json({ id: req.session.userId });
}

module.exports = {
  signup: asyncHandler(signup),
  login: asyncHandler(login),
  logout,
  me,
};
