/// Copyright by Erik Weitnauer, 2012.
/// Ein Kugelgelenk (-2 Translationsfreiheitsgrade).

/// Constructor. pos_a is local for body_a, pos_b local for body_b.
Joint = function(body_a, pos_a, body_b, pos_b) {
  this.body_a = body_a;
  this.body_b = body_b;
  this.pos_a = pos_a;
  this.pos_b = pos_b;
  this.eps_pos = 1e-6;
  this.eps_vel = 1e-6;
}

Joint.prototype.aInWorld = function() {
  return this.body_a.to_world(this.pos_a);
}

Joint.prototype.bInWorld = function() {
  return this.body_b.to_world(this.pos_b);
}

/// Applies correction impulses to the connected bodies. Call before the bodies
/// were moved!
Joint.prototype.correctPosition = function(dt) {
  if (!this.body_a.dynamic && !this.body_b.dynamic) return;

  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b);

  var new_a = this.body_a.to_world(this.pos_a, dt)
     ,new_b = this.body_b.to_world(this.pos_b, dt);
  var d = new_b.sub(new_a);

  // if distance of joint parts is in threshold just return
  if (d.len() <= this.eps_pos) return true;

  // otherwise calculate correction impulses
  var coeffs = [0, 0, 0];
  var update_coeffs = function(body, pos) {
    var m = body.inv_m, I = body.inv_I, r = pos.sub(body.s);
    coeffs[0] += m + I*r.y*r.y;
    coeffs[1] -= I*r.x*r.y;
    coeffs[2] += m + I*r.x*r.x;
  }
  if (this.body_a.dynamic) update_coeffs(this.body_a, a);
  if (this.body_b.dynamic) update_coeffs(this.body_b, b);
  var res = solve_2_lin_equ(coeffs[0], coeffs[1], coeffs[1], coeffs[2],
                            1/dt * d.x, 1/dt * d.y);
  if (!res) throw "no unique solution to lin. eq. system";

  var p = new Point(res[0], res[1]);
  this.body_a.applyImpulse(p, a);
  this.body_b.applyImpulse(p.scale(-1), b);
}

Joint.prototype.correctVelocity = function() {
  if (!this.body_a.dynamic && !this.body_b.dynamic) return;
  
  var a = this.body_a.to_world(this.pos_a)
     ,b = this.body_b.to_world(this.pos_b)
     ,dv = this.body_b.get_v_at(b).sub(
           this.body_a.get_v_at(a));
 
  // if velocity difference between joint parts is below threshold just return
  if (dv.len() <= this.eps_vel) return false;

  // otherwise calculate correction impulses
  var coeffs = [0, 0, 0]; // a, b, d
  var update_coeffs = function(body, pos) {
    var m = body.inv_m, I = body.inv_I, r = pos.sub(body.s);
    coeffs[0] += m + I*r.y*r.y;
    coeffs[1] -= I*r.x*r.y;
    coeffs[2] += m + I*r.x*r.x;
  }
  if (this.body_a.dynamic) update_coeffs(this.body_a, a);
  if (this.body_b.dynamic) update_coeffs(this.body_b, b);
  var res = solve_2_lin_equ(coeffs[0], coeffs[1], coeffs[1], coeffs[2],
                            dv.x, dv.y);
  if (!res) throw "no unique solution to lin. eq. system";

  var p = new Point(res[0], res[1]);
  this.body_a.applyImpulse(p, a);
  this.body_b.applyImpulse(p.scale(-1), b);
  return true;
}
