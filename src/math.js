/// solves the linear equation system
/// a*x1 + b*x2 = e
/// c*x1 + d*x2 = f
/// by applying Cramer's rule.
/// Returns [x1, x2] if a unique solution exists or null otherwise.
solve_2_lin_equ = function(a, b, c, d, e, f) {
  var detA = (a*d-b*c);
  if (Math.abs(detA < 1e-12)) return null;
  return [(e*d-b*f)/detA, (a*f-e*c)/detA];
}
