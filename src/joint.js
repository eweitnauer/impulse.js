/// Copyright by Erik Weitnauer, 2012.
/// Ein Kugelgelenk (-2 Translationsfreiheitsgrade).

/// Constructor. pos_a is local for body_a, pos_b local for body_b.
Joint = function(body_a, pos_a, body_b, pos_b) {
  this.ba = body_a;
  this.bb = body_b;
  this.sa = pos_a;
  this.sb = pos_b;
  this.eps = Joint.EPS;
}

Joint.EPS = 1e-3;

Joint.prototype.aInWorld = function() {
  return this.ba.to_world(this.sa);
}

Joint.prototype.bInWorld = function() {
  return this.bb.to_world(this.sb);
}
