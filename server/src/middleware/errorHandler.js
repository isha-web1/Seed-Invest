export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier." });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value for a unique field." });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal server error." });
};
