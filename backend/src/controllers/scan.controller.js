/**
 * Stub controller handler for launching a scan.
 * Receives validated target context from request object.
 */
export const startScan = (req, res) => {
  const { target, type, details } = req.validatedTarget;

  res.status(200).json({
    success: true,
    message: 'Scan target validated and structured successfully.',
    data: {
      target,
      type,
      details
    }
  });
};

export default {
  startScan
};
