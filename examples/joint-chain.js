/// Written by Erik Weitnauer, 2012.
/// Simulates a chain of sticks connected by ball joints.

// simulation parameters
var params = {
  N: {value: 10, range: [1,100], label: "chain segments", type: 'number'}
 ,len: {value: 1, postfix: " m", type: 'fixed', label:"length"}
 ,mass: {value: 1, postfix: " kg", type: 'fixed'}
 ,inertia: {value: 0.33, values: [0.001,0.01,0.1,0.33,1,10], postfix: " kg*m^2", type: 'number'}
 ,timestep: {value: 10, values: [1, 5, 10, 20, 40, 100], postfix:" ms", type: 'number'}
 ,max_err: {value: 0.001, values: [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001], postfix: " m", label:"pos. error epsilon", type: 'number'}
 ,max_verr: {value: 0.001, values: [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001], postfix: " m/s", label:"vel. error epsilon", type: 'number'}
 ,corr_steps: {value: 5, label: "max. pos. corr. steps", values: [1,2,3,4,5,10,50,100,1000,10000], type: 'number'}
 ,vcorr_steps: {value: 5, label: "max. vel. corr. steps", values: [1,2,3,4,5,10,50,100,1000,10000], type: 'number'}
 ,p_factor: {value: 1.5, range: [0.5, 2], step: 0.1, label: "scaling of correction impulses", type: 'number'}
 ,corr_mode: {value: 'below epsilon', label: "stop corr. when error", values: ['below epsilon', 'gets worse'], type: 'number'}
}

var len = 1; // each body has a length of 1 m
var world = new World(new Point(0,10), params.corr_steps.value, params.vcorr_steps.value);
var timer_id;

// visualization parameters
var w = 960,    // visualization width in pixels
    h = 600,    // visualization height in pixels
    r = 0.2,    // radius of joint visualization in meter
    scale = w/2/len/params.N.value*0.9; // 1 m in physic = x pixel in visualization

/// called on page load
function init() {
  initVisualization();
  
  addSimulationControls(play, pause, step, stop_movement);
  
  addParamControls("#sliders", params, update_params);  
}

/// appends svg element and global g for transformation
function initVisualization() {
  var svg = d3.select("#simulation")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
}

function play() {
  timer_id = setInterval(function() {
    world.step(params.timestep.value/1000);
    update();
  }, params.timestep.value);
}

function pause() {
  clearInterval(timer_id);
}

function step() {
  world.step(params.timestep.value/1000);
  update();
}

function stop_movement() {
  world.stopMovement();
  update();
}

var param_array = create_param_array(params);

var colors = d3.scale.category10();

function update_params() {
  // apply parameter values to the simulation
  // body count should be N+1 (the 1 is the static body at the top)
  var N = params.N.value;
  var N_changed = world.bodies.length != N+1;
  while (world.bodies.length < N+1) addBody();
  if (world.bodies.length > N+1) {
    world.bodies.splice(N+1);
    world.joints.splice(N);
  }
  if (N_changed) updateN();
    
  // mass, inertia
  world.bodies.forEach(function(body) {
    body.inv_m = 1/params.mass.value;
    body.inv_I = 1/params.inertia.value;  
  });
  
  // max_err, max_verr, p_factor
  world.joints.forEach(function(joint) {
    joint.eps_pos = params.max_err.value;
    joint.eps_vel = params.max_verr.value;
    joint.p_factor = params.p_factor.value;
  });
  
  // corr_steps, vcorr_steps
  world.max_corr_it = params.corr_steps.value;
  world.max_vcorr_it = params.vcorr_steps.value;
  
  // stop on...
  world.stop_corr_on_worse = $('#stop_on_worse')[0].checked;
  
  update();
}

/// Adds one body to the chain. If its not the first one, it gets connected with
/// a ball joint to the last body.
function addBody() {
  // is this the first body in the scene?
  if (world.bodies.length == 0) {
    // yes, so make it static
    var b = new Body(new Point(0, 0), new Point(0, 0),
                     params.mass.value, 0, 0, params.inertia.value);
    b.dynamic = false;
    world.bodies.push(b);
  } else {
    // not first body, make it dynamic and link to last body by a ball joint
    var a = world.bodies[world.bodies.length-1];
    var pos = a.to_world(new Point(0,len/2));
    pos.x += len/2;
    var b = new Body(pos, new Point(), params.mass.value, -Math.PI*0.5, 0, params.inertia.value);
    world.bodies.push(b);
    world.joints.push(new Joint(a, new Point(0,len/2), b, new Point(0,-len/2)));  
  }
}

function dragmove(d, i) {
  var s = w/2/len/(params.N.value+1);
  d.s.x += d3.event.dx/s;
  d.s.y += d3.event.dy/s;
  update();
}

var drag_body = d3.behavior.drag()
  .on("drag", dragmove)
  .on("dragstart", function(d) { d.was_dynamic = d.dynamic; d.dynamic = false; update();})
  .on("dragend", function(d) {d.dynamic = d.was_dynamic; update();})

var bs, js;

function updateN() {
  bs = d3.select("svg").selectAll("rect.body").data(world.bodies);
  var s = w/2/len/(params.N.value+1);
  var N = params.N.value;
  
  bs.exit().remove();

  bs.enter().append("rect")
    .on("click", function(d,i) { d.dynamic = !d.dynamic; update(); })
    .attr("class", "body")
    .call(drag_body);
  
  bs.attr("x", Math.min(-1,s*(-r/2)))
    .attr("y", s*(-len/2-r/2))
    .attr("width", Math.max(2,s*r))
    .attr("height", s*(len+r))
    .attr("rx", N>20 ? null : s*r/2)
    .attr("ry", N>20 ? null : s*r/2)
    .attr("stroke-width", s*r/4)
  
  js = d3.select("svg").selectAll("circle.joint").data(world.joints);
  
  js.exit().remove();
  
  js.enter().append("circle")
    .attr("class", "joint")
    .attr("fill", "gray")
    .attr("stroke", "black");
    
  js.attr("stroke-width", s*r/4)
    .attr("r", s*r/4);
}

function update() {
  var s = w/2/len/(params.N.value+1);
  var N = params.N.value;
  
  bs.attr("transform", function(d) {
           return 'translate(' + (s*d.s.x+w/2) + ',' + s*(d.s.y+len) + ') ' +
                  'rotate(' + 180/Math.PI*d.r + ') '})
    .attr("stroke", N>20 ? "none" : function(d,i)
         { return d.dynamic ? colors(i) : "#eee" })
    .attr("fill", function(d,i)
         { return d.dynamic ? d3.hsl(colors(i)).brighter() : "#eee" })

  js.style("display", N>20 ? "none" : null)
    .attr("cx", function(d) { return d.aInWorld().x*s+w/2; })
    .attr("cy", function(d) { return d.aInWorld().y*s+s*len; });
}
