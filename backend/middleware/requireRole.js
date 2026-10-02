/**
 * RBAC — restringe rotas a roles específicas.
 */
module.exports = (roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Permissão insuficiente.",
    });
  }
  next();
};
