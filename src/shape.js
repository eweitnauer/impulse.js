/// Copyright by Erik Weitnauer, 2012.

/// collision shape -- for now only a single point with radius (aka circle).
/*
Each body in the simulation that can collide with other bodies has one collision
shape assigned to it. The collision shape can have several geometries.

Flow of a simulation step:
- detect contact points and normals of all collision shapes
- perform sim. step while considering the contacts
- if two bodies intersect, undo sim. step and set new timestep to approx. time
  of collision
*/

function Shape(position, radius) {
  this.s = position;
  this.radius = radius;
}

/// Returns true if the shapes overlap.
Shape.prototype.collides(other) {
  return this.s.sub(other.s).len2() <= Math.pow(this.radius+other.radius,2);
}

/// Returns the collision depth / distance, the closest points in world coords
/// and the contact normal as {dist: Number, pa: Point, pb: Point, n: Point}.
/// The contact normal has length of 1 and points from this to other.
Shape.prototype.getCollisionGeometry(other) {
  var dc = other.s.sub(this.s);
  var n = dc.normalize();
  return { dist: dc.len()-(this.radius+other.radius)
          ,pa: this.s.add(n.mul(this.radius))
          ,pb: other.s.sub(n.mul(other.radius))
          ,n: n};
}
