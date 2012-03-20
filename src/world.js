/// Copyright by Erik Weitnauer, 2012.

// TODO: In velocity and position control, things might get worse when using a
// timestep that is too big. Therefore, we need an algorithm that automatically
// reduces the timestep each time a corrections step makes things worse.
// With the reduced timestep, the simulation needs to be stepped more often to
// reach the original timestep.

// Things that improve iterative performance (a lot):
// 1) Scale the correction impulses with 1.5
// 2) Stop position and velocity correction, if result get worse in one step
// Actually, this is already quite good, so I don't know if we should change
// this.

// TODO: Implement the LGS-method that solves a linear equations system to
// correct the joints.

World = function(gravity, pos_it, vel_it) {
  this.gravity = gravity || new Point(0, 10)
  this.bodies = []
  this.joints = []
  this.max_corr_it = pos_it || 10;
  this.max_vcorr_it = vel_it || 10;
  this.stop_corr_on_worse = true;
  this.initial_energy = null;
  
  // two objects may overlap no more than eps_coll on contact or collision
  this.eps_coll = 0.001;
}

World.prototype.calcEnergy = function() {
  var sum = 0;
  for (var i=0; i<this.bodies.length; i++) {
    sum += this.bodies[i].getEnergy(this.gravity);
  }
  return sum;
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
}

World.prototype.step = function(h) {
  if (this.initial_energy == null) this.initial_energy = this.calcEnergy();
  this.stepA(h);
  this.stepB(h);
  this.stepC(h);
  //console.log("Energy difference to start:", this.calcEnergy()-this.initial_energy);
}

/// For each joint, impulses are applied to its bodies, so they stay connected
/// when doing a time step h.
World.prototype.jointPositionCorrection = function(h) {
  var iterations = 0;
  var change;
  var last = Infinity;
  var now = 0;
  for (var i=0; i<this.joints.length; i++) {
    now += this.joints[i].getPositionError(h);
  }
  //console.log('PositionCorrection starts with ', now);
  do {
    change = false;
    var now = 0;
    for (var i=0; i<this.joints.length; i++) {
      change = this.joints[i].correctPosition(h) || change;
    }
    for (var i=0; i<this.joints.length; i++) {
      now += this.joints[i].getPositionError(h);
    }
    //console.log(now);
    if (this.stop_corr_on_worse) change = now<last;
    last = now;
    if (change) iterations++;
  } while (change && iterations<this.max_corr_it);
  //this.max_vcorr_it = iterations;
  //console.log(iterations);//, last/this.joints.length);
  return change;
}

/// For each joint, impulses are applied to its bodies, so they have the same
/// speed.
World.prototype.jointVelocityCorrection = function() {
  var iterations = 0;
  var change;
  var last = Infinity;
  do {
    change = false;
    var now = 0;
    for (var i=0; i<this.joints.length; i++) {
      change = this.joints[i].correctVelocity() || change;
    }
    for (var i=0; i<this.joints.length; i++) {
      now += this.joints[i].getVelocityError();
    }
    if (this.stop_corr_on_worse) change = now<last;
    last = now;
    if (change) iterations++;
  } while (change && iterations<this.max_vcorr_it);
  //console.log('v', iterations)//, last/this.joints.length);
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
