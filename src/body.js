Body = function(position, linear_velocity, mass, rotation, angular_velocity, inertia) {
  this.pos = position;
  this.dpos = linear_velocity;
  this.mass = mass;
  this.rot = rotation;
  this.drot = angular_velocity;
  this.inertia = inertia;
  this.dynamic = true;
  this.forces = new Point(0,0); // central forces acting on cog
}

/// forces are cleared afterwards
Body.prototype.integrate = function(h) {
  this.pos.Add(this.dpos.scale(h)).Add(this.forces.scale(0.5*h*h));
  this.dpos.Add(this.forces.scale(h));
  this.rot += h*this.drot;
  this.forces.set(0,0);
}

/// pos is optional and in world coords.
Body.prototype.applyImpulse = function(imp, pos) {
  this.dpos.Add(imp.scale(1/this.mass));
  if (typeof(pos) !== 'undefined') {
    this.drot.Add(pos.sub(this.pos).cross(imp) * (1/this.inertia));
  }
}

/// Adds a central, constant force to the forces vector, which is applied at integrate.
Body.prototype.applyForce = function(force) {
  this.forces.Add(force);
}
