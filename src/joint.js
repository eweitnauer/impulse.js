/// Copyright by Erik Weitnauer, 2012.
/// Ein Kugelgelenk (-2 Translationsfreiheitsgrade).

/// Constructor. pos_a is local for body_a, pos_b local for body_b.
Joint = function(body_a, pos_a, body_b, pos_b) {
  this.body_a = body_a;
  this.body_b = body_b;
  this.pos_a = pos_a;
  this.pos_b = pos_b;
  this.eps_pos = 1e-4;
  this.eps_vel = 1e-4;
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
  if (!this.body_a.dynamic && !this.body_b.dynamic) return;
  
  // calculate distance vector B-A after dt
  var d = this.body_b.to_world(this.pos_b, dt).sub(
          this.body_a.to_world(this.pos_a, dt));
  
  // return if distance is in epsilon-range
  if (d.len() <= this.eps_pos) return d.len();
  
  // calculate correction impulses
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b);
  
  var K = this.body_a.getK(a).add(
          this.body_b.getK(b)); 
  var p = K.inv().mul(d.scale(1/dt));

  // apply impulses
  this.body_a.applyImpulse(p.scale(1.5), a); // it should be 1., but this converges faster somehow...
  this.body_b.applyImpulse(p.scale(-1.5), b); // it should be -1.0, but this converges faster somehow...
  
  // calculate distance vector B-A after dt
  var d = this.body_b.to_world(this.pos_b, dt).sub(
          this.body_a.to_world(this.pos_a, dt));
  return d.len();
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
  if (!this.body_a.dynamic && !this.body_b.dynamic) return;
  
  // calculate difference in speed at joint
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
 
  // if velocity difference between joint parts is below threshold just return
  if (dv.len() <= this.eps_vel) return dv.len();

  // otherwise calculate correction impulses
  var K = this.body_a.getK(a).add(
          this.body_b.getK(b)); 
  var p = K.inv().mul(dv);

  // apply impluses
  this.body_a.applyImpulse(p.scale(1.5), a);   // it should be 1.0, but this converges faster somehow...
  this.body_b.applyImpulse(p.scale(-1.5), b);  // it should be -1.0, but this converges faster somehow...

  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
  return dv.len();
  //return true;
}
