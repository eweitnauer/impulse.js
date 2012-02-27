/// Copyright by Erik Weitnauer, 2012.

Body = function(position, linear_velocity, mass, rotation, angular_velocity, inertia) {
  this.s = position;
  this.v = linear_velocity;
  this.m = mass;
  this.r = rotation;
  this.w = angular_velocity;
  this.I = inertia;
  this.dynamic = true;
  this.force = new Point(0,0); // external forces acting on cog
  this.torque = 0;
}

/// external forces are cleared afterwards
Body.prototype.integrate = function(h) {
  // s(t0 + h) = s(t0) + v(t0)*h + 0.5*(1/m)*F*h*h
  this.s.Add(this.v.scale(h)).Add(this.force.scale(0.5*h*h/this.m));
  // v(t0 + h) = v(t0) + (1/m)*F*h
  this.v.Add(this.force.scale(h/this.m));
  // r(t0 + h) = r(t0) + h*w + 0.5*(1/I)*T*h*h;
  this.r += h*this.w + 0.5/this.I*this.torque*h*h;
  // w(t0 + h) = w(t0) + (1/I)*T*h
  this.w += this.torque/this.I*h;
  this.force.set(0,0);
  this.torque = 0;
}

/// Apply an impulse to the body which results in a direct change of velocity.
/// pos is optional and in world coords.
Body.prototype.applyImpulse = function(p, pos) {
  this.v.Add(p.scale(1/this.m));
  if (typeof(pos) == 'undefined') return;
  this.w.Add(pos.sub(this.pos).cross(p) * (1/this.I));
}

/// Apply a constant force to the body for the next time step.
/// pos is in world coordinates and its default is the cog of the object.
Body.prototype.applyForce = function(F, pos) {
  this.force.Add(F);
  if (typeof(pos) == 'undefined') return;
  this.torque += F.cross(pos.sub(this.s));
}

Body.prototype.to_world = function(s_local) {
  return this.s.add(s_local.rotate(this.r));
}
