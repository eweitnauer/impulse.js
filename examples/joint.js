var world = new World();
var w = 960,
    h = 600,
    r = 5,
    scale = 25, // 1 m in physic = 100 pixel in visualization
    len = 1,
    timestep = 1/200;
var bodies, joints, v_bodies;
var timer_id;

function init() {
  var mass = 1,
      I = 1/3*mass*len; // Inertia eines langen Stabes
      //I = 1/2*mass*r*r/scale/scale; // Inertia einer Kreisscheibe

  var N = 20; // number of swinging bars
  var bs = [];
  bs.push(new Body(new Point(w/scale/2, len), new Point(), mass, 0, 0, I));
  bs[0].dynamic = false;
  world.bodies.push(bs[0]);
  for (var i=0; i<N; i++) {
    bs.push(new Body(new Point(w/scale/2 + (i+0.5)*len, len + len/2), new Point(), mass, -Math.PI*0.5, 0, I));
    world.bodies.push(bs[i+1]);
    world.joints.push(new Joint(bs[i], new Point(0,len/2), bs[i+1], new Point(0,-len/2)));
  }
    
  show();
  
  // stepA button
  d3.select("body").append("a")
    .text("JointCorr")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepA(timestep);
        update();
     });
  // stepB button
  d3.select("body").append("a")
    .text("Integrate")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepB(timestep);
        update();
     });
  // stepC button
  d3.select("body").append("a")
    .text("JointVCorr")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stepC(timestep);
        update();
     });
  // reset speed button
  d3.select("body").append("a")
    .text("Reset Speed")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        world.stopMovement();
        update();
     });
  // play button   
  d3.select("body").append("a")
    .text("Play")
    .attr("class", "button")
    .attr("href", "/")
    .on("click", function() {
        d3.event.preventDefault();
        if (this.text == "Play") {
          this.innerHTML = "Pause";
          timer_id = setInterval(function() {
            world.step(timestep);
            update();
          }, 1000/30);
        } else {
          this.innerHTML = "Play";
          clearInterval(timer_id);
        }
     });
}

function show() {
  var colors = d3.scale.category10();
  var drag = d3.behavior.drag()
      .on("drag", dragmove);

  var svg = d3.select("body").append("svg")
      .attr("width", w)
      .attr("height", h)
    
  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "rgb(250,250,255)")


  bodies = svg.selectAll("g.body")
        .data(world.bodies)
        .enter().append("g")
        .attr("class", "body")

  bodies.call(drag);
  
  bodies.append("rect")
        .attr("x", -4)
        .attr("y", -len/2*scale-r)
        .attr("width", 8)
        .attr("height", len*scale+2*r)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("stroke", function(d,i) { return colors(i); })
        .attr("fill", function(d,i) { return d3.hsl(colors(i)).brighter() } )
        .attr("stroke-width", "3px")

//  bodies.append("line")
//        .attr("x1", 0)
//        .attr("y1", -len/2*scale)
//        .attr("x2", 0)
//        .attr("y2", len/2*scale)
//        .attr("stroke", function(d,i) { return d3.hsl(colors(i)).brighter() } )
//        .attr("stroke-linecap", "round")
//        .attr("stroke-width", "4px")
  
  joints = svg.selectAll("circle.joint")
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
  bodies
    .attr("transform", function(d) { return 'translate(' + d.s.x*scale + ',' + d.s.y*scale + ') rotate(' + 180/Math.PI*d.r + ")" })
//    .attr("transform", function(d) { return "rotate(" + d.r + ")"})
    
  joints
    .attr("cx", function(d) { return d.aInWorld().x*scale; })
    .attr("cy", function(d) { return d.aInWorld().y*scale; })
}

/// Values might either be an array (then its values are used to label the
/// buttons) or an integer (then its the number of elements and the buttons are
/// labeled from 1 to values).
/// The values of the buttons (which are passed to the callback function) run
/// from 0 to (number_of_buttons-1) in the integer case or are the array values
/// in the array case.
/// Returns an array of the button <a> elements.
function addButtons(div, values, callback) {
  var use_labels = (typeof(values) !== 'number');
  var l = use_labels ? values.length : values;
  var btns = [];
  for (var i=0; i<l; ++i) {
    var a = document.createElement('a');
    a.className = "button";
    a.innerHTML = use_labels ? values[i] : i+1;
    a.setAttribute('href', '/');
    a.value = use_labels ? values[i] : i;
    a.addEventListener("click", function(event) {
      event.preventDefault();
      callback(event.target.value, event.target);
    }, false);
    div.appendChild(a);
    btns.push(a);
  }
  return btns;
}
