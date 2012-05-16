/// Copyright by Erik Weitnauer, 2012.
/// Ball joint (-2 translational degrees of freedom).

/// Constructor. pos_a is local for body_a, pos_b local for body_b.
Joint = function(body_a, body_b, pos) {
  this.body_a = body_a;
  this.body_b = body_b;
  this.pos_a = body_a.to_local(pos);
  this.pos_b = body_b.to_local(pos);
  this.eps_pos = 1e-3;
  this.eps_vel = 1e-3;
  this.p_factor = 1.0; // the correct correction impulse is multiplied by this
                       // when we do more than one correction step, a value of
                       // 1.5 may lead to faster conversion.
}

Joint.prototype.aInWorld = function() {
  return this.body_a.to_world(this.pos_a);
}

Joint.prototype.bInWorld = function() {
  return this.body_b.to_world(this.pos_b);
}

Joint.prototype.getPositionError = function(dt) {
  // calculate distance vector B-A after dt
  var d = this.body_b.to_world(this.pos_b, dt).sub(
          this.body_a.to_world(this.pos_a, dt));
  return d.len();
}

/// Applies correction impulses to the connected bodies, so the joint positions
/// of both bodies are the same. Call before the bodies are moved.
/// Returns true if bodies were changed.
Joint.prototype.correctPosition = function(dt) {
  // don't do this if both bodies are static
  if (!this.body_a.dynamic && !this.body_b.dynamic) return false;
  
  // calculate distance vector B-A after dt
  var d = this.body_b.to_world(this.pos_b, dt).sub(
          this.body_a.to_world(this.pos_a, dt));
  
  // return if distance is in epsilon-range
  if (d.len() <= this.eps_pos) return false//d.len();
  
  // calculate correction impulses
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b);
  
  var K = this.body_a.getK(a).add(
          this.body_b.getK(b)); 
  var p = K.inv().mul(d.scale(1/dt));

  // apply impulses
  // the correct impulses should be scaled with 1 and -1. This gives the best
  // results for 1 iteration step. However, when using more than one step, a
  // scaling factor of 1.5 converges much faster
  this.body_a.applyImpulse(p.scale(this.p_factor), a);
  this.body_b.applyImpulse(p.scale(-this.p_factor), b);
  
  // calculate distance vector B-A after dt
  var d = this.body_b.to_world(this.pos_b, dt).sub(
          this.body_a.to_world(this.pos_a, dt));
  return true;
}

Joint.prototype.getVelocityError = function() {
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
  return dv.len();
}

/// Applies correction impulses to the connected bodies, so that the joint speeds
/// of both bodies are the same. Call after the bodies were moved.
/// Returns true if bodies were changed.
Joint.prototype.correctVelocity = function() {
  // don't do this if both bodies are static
  if (!this.body_a.dynamic && !this.body_b.dynamic) return false;
  
  // calculate difference in speed at joint
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
 
  // if velocity difference between joint parts is below threshold just return
  if (dv.len() <= this.eps_vel) return false;//dv.len();

  // otherwise calculate correction impulses
  var K = this.body_a.getK(a).add(
          this.body_b.getK(b)); 
  var p = K.inv().mul(dv);

  // apply impluses
  // the correct impulses should be scaled with 1 and -1. This gives the best
  // results for 1 iteration step. However, when using more than one step, a
  // scaling factor of 1.5 converges much faster
  this.body_a.applyImpulse(p.scale(this.p_factor), a);   
  this.body_b.applyImpulse(p.scale(-this.p_factor), b);

  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
  return true;
  //return true;
}
