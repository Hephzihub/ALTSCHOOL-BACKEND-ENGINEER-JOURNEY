export const checkAge = (req, res, next) => {
  const { age } = req.body;
  if (age < 18) {
    return res.status(400).json({ message: 'Age must be at least 18' });
  }
  next();
}