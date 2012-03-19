/// Copyright by Erik Weitnauer, 2012.

/// Collision shape -- for now only points with radius (aka circles).

function Shape(position, radius) {
  this.s = position;
  this.radius = radius;
}

/// Returns true if the shapes overlap.
Shape.prototype.collides(other) {
  return this.s.sub(other.s).len2() <= Math.pow(this.radius+other.radius,2);
}

/// Returns the contact point and normalized contact normal: {p: Point, n: Point}.
Shape.prototype.getCollisionGeometry(other) {
  var p = this.s.add(other.s).mul(0.5);
  var n = other.s.sub(this.s).normalize();
  return {p: p, n: n};
}
