/// Simulates a chain of sticks connected by ball joints.

// physics parameters
var world = new World(new Point(0,10), 10, 10);
var N = 25,           // number of connected sticks (+ 1 that is fixed)
    len = 1,          // object length is 1 m
    mass = 1,         // object mass is 1 kg
    I = 1/3*mass*len, // inertia of object (langer Stab)
    timestep = 1/100, // simulation timestep: 10 ms
    timer_id = null;

var params = {
  N: {value: 25, range: [1,100], label: "number of objects"}
 ,timestep: {values: [1, 5, 10, 20, 40, 100], idx: 2, postfix:" ms"}
 ,mass: {values: [0.001,0.01,0.1,1,10], idx: 3, postfix: " kg"}
 ,inertia: {values: [0.001,0.01,0.1,0.33,1,10], idx: 3, postfix: " kg*m^2"}
 ,max_err: {values: [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001], idx: 2}
 ,max_verr: {values: [0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001], idx: 2}
 ,corr_steps: {label: "max. corr. steps", values: [1,2,3,4,5,10,50,100,1000,10000], idx: 5}
 ,vcorr_steps: {label: "max. v-corr. steps", values: [1,2,3,4,5,10,50,100,1000,10000], idx: 5}
 ,p_factor: {value: 1, range: [0.5, 2], step: 0.1, label: "correction impulse factor"}
 }
  
function create_param_array() {
  var a = [];
  for (var id in params) {
    var p = params[id];
    p.id = id;
    a.push(p);
  }
  return a;
}

var param_array = create_param_array();

// visualization parameters
var w = 960,    // visualization width in pixels
    h = 600,    // visualization height in pixels
    r = 5,      // radius of joint visualization in pixels
    scale = w/2/len/N*0.9, // 1 m in physic = x pixel in visualization
    body_vis, joint_vis; // d3 selections holding the svg visualizations

var colors = d3.scale.category10();

//hover states on the static widgets
function addControls() {
  $('#dialog_link, ul#icons li').hover(
	  function() { $(this).addClass('ui-state-hover'); }, 
	  function() { $(this).removeClass('ui-state-hover'); }
  );
  $('#play').click(function(evt) {
    evt.preventDefault();
    var sp = $("#play span");
    if (sp.hasClass('ui-icon-play')) {
      sp.removeClass('ui-icon-play');
      sp.addClass('ui-icon-pause');
      $("#play").addClass('ui-state-active');
      timer_id = setInterval(function() {
        world.step(timestep);
        update();
      }, 1000/100);
    } else {
      sp.removeClass('ui-icon-pause');
      sp.addClass('ui-icon-play');
      $("#play").removeClass('ui-state-active');
      clearInterval(timer_id);
    }
  });
  $("#step").click(function(evt) {
    evt.preventDefault();
    world.step(timestep);
    update();
  });
  $("#stop_movement").click(function(evt) {
    evt.preventDefault();
    world.stopMovement();
    update();
  });
  
  function update_params() {
    d3.selectAll("div.parameter")
      .data(param_array)
      .select("span")
      .text(function(d) { 
        var val = ('values' in d) ? d.values[d.idx] : d.value;
        var str = ('postfix' in d) ? d.postfix : '';
        return val + str;
      });
  }
  
  var divs = d3.select("#sliders").selectAll("div.parameter")
    .data(param_array).enter()
    .append("div")
    .attr("class", "parameter");
  
  divs.append("p")
    .text(function(d) { return (d.label || d.id) + ': ' })
    .append("span");
    
  divs.append("div")
    .attr("id", function(d) { return d.id })
    .each(function(d) {
      $("#"+d.id).slider({
        min: 'range' in d ? d.range[0] : 0
       ,max: 'range' in d ? d.range[1] : d.values.length-1
       ,value: 'idx' in d ? d.idx : d.value
       ,step: (d.step || 1)
       ,slide: function(evt, ui) {
          if ('value' in d) d.value = ui.value;
          else d.idx = ui.value;
          update_params(); }
      });
      update_params();
    });
 
	$( "#stop_correction_on" ).buttonset();
};
				
function init() {
  var bs = [];
  bs.push(new Body(new Point(w/scale/2, h*0.05/scale), new Point(), mass, 0, 0, I));
  bs[0].dynamic = false;
  world.bodies.push(bs[0]);
  for (var i=0; i<N; i++) {
    bs.push(new Body(new Point(w/scale/2 + (i+0.5)*len, h*0.05/scale + len/2), new Point(), mass, -Math.PI*0.5, 0, I));
    world.bodies.push(bs[i+1]);
    world.joints.push(new Joint(bs[i], new Point(0,len/2), bs[i+1], new Point(0,-len/2)));
  }
  
  initVisualization();
  addControls();
}

function initVisualization() {
  var drag = d3.behavior.drag()
      .on("drag", dragmove)
      .on("dragstart", function(d) { d.was_dynamic = d.dynamic; d.dynamic = false; update();})
      .on("dragend", function(d) {d.dynamic = d.was_dynamic; update();})

  var svg = d3.select("body")
      .style("background-color", "#444")
      .select("#simulation")
      .append("svg")
      .attr("width", w)
      .attr("height", h)
    
//  svg.append("rect")
//    .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h)
//    .attr("rx", 6).attr("ry", 6)
//    .attr("stroke", "#ccc")
//    .attr("stroke-width", 2)
////    .attr("fill", "rgb(250,250,255)")
//    .attr("fill", "#222")

  body_vis = svg.selectAll("g.body")
        .data(world.bodies)
        .enter().append("g")
        .attr("class", "body")
        .on("click", function(d) {d.dynamic = !d.dynamic; update()});

  body_vis.call(drag);
  
  body_vis.append("rect")
        .attr("x", -4)
        .attr("y", -len/2*scale-r)
        .attr("width", 8)
        .attr("height", len*scale+2*r)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("stroke", function(d,i) { if (d.dynamic) return colors(i);
                                        else return "#aaa"; })
        .attr("fill", function(d,i) { if (d.dynamic) return d3.hsl(colors(i)).brighter();
                                      else return d3.hsl("#aaa") } )
        .attr("stroke-width", "3px")
  
  joint_vis = svg.selectAll("circle.joint")
      .data(world.joints)
      .enter().append("circle")
      .attr("class", "joint")
      .attr("fill", "gray")
      .attr("stroke", "black")
      .attr("stroke-width", "2px")
      .attr("r", r-2);

  update();
  
  function dragmove(d, i) {
    d.s.x = Math.max(r, Math.min(w - r, d3.event.x))/scale;
    d.s.y = Math.max(r, Math.min(h - r, d3.event.y))/scale;
    update();
  }
}

function update() {
  body_vis
    .attr("transform", function(d) {
      return 'translate(' + d.s.x*scale + ',' + d.s.y*scale +
             ') rotate(' + 180/Math.PI*d.r + ")" })
    .select("rect")
    .attr("stroke", function(d,i) { if (d.dynamic) return colors(i);
                                        else return "#aaa"; })
    .attr("fill", function(d,i) { if (d.dynamic) return d3.hsl(colors(i)).brighter();
                                      else return d3.hsl("#aaa") } )
             
  joint_vis
    .attr("cx", function(d) { return d.aInWorld().x*scale; })
    .attr("cy", function(d) { return d.aInWorld().y*scale; })
}
