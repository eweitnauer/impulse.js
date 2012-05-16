/// Copyright by Erik Weitnauer, 2012.

/** Constructor */
Body = function(position, linear_velocity, mass, rotation, angular_velocity, inertia) {
  this.s = position;
  this.v = linear_velocity;
  this.inv_m = 1/mass;
  this.r = rotation;
  this.w = angular_velocity;
  this.inv_I = 1/inertia;
  this.dynamic = true;
  this.force = new Point(0,0); // external forces acting on cog
  this.torque = 0;
}

/** Performs a timestep of dt to the objects using the current force and torque. */
Body.prototype.integrate = function(dt) {
  if (!this.dynamic) return;
  // s(t0 + dt) = s(t0) + v(t0)*dt + 0.5*(1/m)*F*dt^2
  this.s.Add(this.v.scale(dt)).Add(this.force.scale(0.5*dt*dt*this.inv_m));
  // v(t0 + dt) = v(t0) + (1/m)*F*dt
  this.v.Add(this.force.scale(dt*this.inv_m));
  // r(t0 + dt) = r(t0) + dt*w + 0.5*(1/I)*T*dt*dt;
  this.r += dt*this.w + 0.5*this.inv_I*this.torque*dt*dt;
  // w(t0 + dt) = w(t0) + (1/I)*T*dt
  this.w += this.torque*this.inv_I*dt;
//  this.force.Set(0,0);
//  this.torque = 0;
}

/** Returns the predicted change of world position of the body after dt.
    Same as integration, but does not change the body. */
Body.prototype.predict_ds = function(dt) {
  return this.v.scale(dt).add(this.force.scale(0.5*dt*dt*this.inv_m));
}

/// Apply an impulse to the body which results in a direct change of velocity.
/// pos is optional and in world coords.
Body.prototype.applyImpulse = function(p, pos) {
  if (!this.dynamic) return;
  this.v.Add(p.scale(this.inv_m));
  if (typeof(pos) == 'undefined') return;
  this.w += pos.sub(this.s).cross(p) * this.inv_I;
}

/// Apply a constant force to the body for the next time step.
/// pos is in world coordinates and its default is the cog of the object.
Body.prototype.applyForce = function(F, pos) {
  if (!this.dynamic) return;
  this.force.Add(F);
  if (typeof(pos) == 'undefined') return;
  this.torque += F.cross(pos.sub(this.s));
}

/// Returns the position of pos_local (in local object coordinates) transformed
/// to world coordinates. If the optinal dt>0 is passed, the predicted position
/// of pos_local in world coordinates after dt of free movement of the body is
/// returned.
Body.prototype.to_world = function(pos, dt) {
  if (dt == null || !this.dynamic) return this.s.add(pos.rotate(this.r));
  // predict position
  var s = this.s.add(this.v.scale(dt)).add(this.force.scale(0.5*dt*dt*this.inv_m));
  var r = this.r + dt*this.w + 0.5*this.inv_I*this.torque*dt*dt;
  return s.add(pos.rotate(r));
}

/** Returns the passed world position transformed into local coordinates */
Body.prototype.to_local = function(pos) {
  return pos.sub(this.s).rotate(-this.r);
}

/// Returns speed of a body point at s (in global coords).
Body.prototype.get_v_at = function(s) {
  if (!this.dynamic) return new Point(0, 0);
  var r = s.sub(this.s);
  return new Point(this.v.x - r.y*this.w, this.v.y + r.x*this.w);
}

/** Returns the matrix describing how an impulse at the passed point (world coordinates) will
  influence the body's speed at this point. */
Body.prototype.getK = function(point) {
  if (!this.dynamic) return new Matrix();
  var r = point.sub(this.s);
  var m = this.inv_m;
  var I = this.inv_I;
  var bc = -I*r.x*r.y;
  return new Matrix(m + I*r.y*r.y, bc, bc, m + I*r.x*r.x);
}

/** Returns sum of kinetic and potential engery */
Body.prototype.getEnergy = function(gravity) {
  var kin = 0.5*(1/this.inv_m)*this.v.len2() + 0.5*(1/this.inv_I)*this.w*this.w;
  var pot = -(1/this.inv_m)*gravity.y*this.s.y
  return  kin + pot;
}
