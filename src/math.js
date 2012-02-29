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

/// ( a b )
/// ( c d )
Matrix = function(a, b, c, d) {
  this.a = a || 0;
  this.b = b || 0;
  this.c = c || 0;
  this.d = d || 0;
}

Matrix.prototype.add = function(M) {
  return new Matrix(this.a + M.a, this.b + M.b, this.c + M.c, this.d + M.d);
}

Matrix.prototype.Add = function(M) {
  this.a += M.a; this.b += M.b; this.c += M.c; this.d += M.d;
  return this;
}

Matrix.prototype.mul = function(v) {
  return new Point(this.a*v.x + this.b*v.y, this.c*v.x + this.d*v.y);
}

Matrix.prototype.mmul = function(M) {
  return new Matrix(this.a*M.a + this.b*M.c, this.a*M.b + this.b*M.d,
                    this.c*M.a + this.d*M.c, this.c*M.b + this.d*M.d);
}

Matrix.prototype.inv = function() {
  var det = 1/ (this.a * this.d - this.b * this.c);
  return new Matrix(this.d*det, -this.b*det, -this.c*det, this.a*det);
}

Matrix.prototype.t = function() {
  return new Matrix(this.a, this.c, this.b, this.d);
}
