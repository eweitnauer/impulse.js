/// Copyright by Erik Weitnauer, 2012.

World = function() {
  this.gravity = new Point(0, 10)
  this.bodies = []
  this.joints = []
  this.max_corr_it = 1000;
  this.max_vcorr_it = 1000;
}

World.prototype.stepA = function(h) {
  this.applyGravity(h);
  this.jointPositionCorrection(h);
}

World.prototype.stepB = function(h) {
  this.integrate(h);
}

World.prototype.stepC = function(h) {
  this.jointVelocityCorrection();
  //this.stopMovement();
}

World.prototype.step = function(h) {
  this.stepA(h);
  this.stepB(h);
  this.stepC(h);
}

/// For each joint, impulses are applied to its bodies, so they stay connected
/// when doing a time step h.
World.prototype.jointPositionCorrection = function(h) {
  var iterations = 0;
  var change;
  var last = Infinity;
  do {
    change = false;
    var now = 0;
    for (var i=0; i<this.joints.length; i++) {
      //change = change || this.joints[i].correctPosition(h);
      now += this.joints[i].correctPosition(h);
    }
    change = now<last;
    last = now;
    if (change) iterations++;
  } while (change && iterations<this.max_corr_it);
  //this.max_vcorr_it = iterations;
  //console.log(iterations, last/this.joints.length);
  return change;
}

/// For each joint, impulses are applied to its bodies, so they have the same
/// speed.
World.prototype.jointVelocityCorrection = function() {
  var iterations = 0;
  var change;
  var last = Infinity;
  do {
    //change = false;
    var now = 0;
    for (var i=0; i<this.joints.length; i++) {
      //change = change || this.joints[i].correctVelocity();
      now += this.joints[i].correctVelocity();
    }
    change = now<last;
    last = now;
    if (change) iterations++;
  } while (change && iterations<this.max_vcorr_it);
  //console.log('v', iterations, last/this.joints.length);
  return change;
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
    //if (body.dynamic) body.applyForce(this.gravity.scale(1/body.inv_m));
    if (body.dynamic) body.force.Set(this.gravity.scale(1/body.inv_m));
  }
}

World.prototype.stopMovement = function() {
  for (var i=0; i<this.bodies.length; i++) {
    var body = this.bodies[i];
    if (body.dynamic) body.v.Set(0,0);
    if (body.dynamic) body.w = 0;
  }
}
