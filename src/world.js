World = function() {
  this.gravity = new Point(0, 10)
  this.bodies = []
}

World.prototype.step = function(h) {
  this.applyGravity(h);
  this.integrate(h);
}

/// Change position and rotation of bodies according to impulses working on them. 
World.prototype.integrate = function(h) {
  for (var i=0; i<this.bodies.length; i++) {
    var body = this.bodies[i];
    if (body.dynamic) body.integrate(h);
  }
}

World.prototype.applyGravity = function() {
  for (var i=0; i<this.bodies.length; i++) {
    var body = this.bodies[i];
    if (body.dynamic) body.applyForce(this.gravity);
  }
}
