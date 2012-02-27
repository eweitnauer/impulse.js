var world = new World();
var w = 960,
    h = 500,
    r = 40;
var circle = null;

function init() {
  var N = 3;
  for (var i=0; i<N; i++) {
    var pos = new Point(r+Math.random()*(w-2*r), r+Math.random()*(h-2*r));
    var vel = new Point();
    world.bodies.push(new Body(pos, vel, Math.random()+0.5, 0, 0, 1));
  }
  
  show();
  setInterval(function() {
    world.step(1/30);
    circle
      .attr("cx", function(d) { return d.s.x; })
      .attr("cy", function(d) { return d.s.y; })
  }, 1000/30);
}

function show() {
  var drag = d3.behavior.drag()
      .on("drag", dragmove);

  var svg = d3.select("body").append("svg")
      .attr("width", w)
      .attr("height", h)

  circle = svg.selectAll("circle")
        .data(world.bodies)
        .enter().append("circle")
        .attr("fill", "rgba(0,0,0,0)")
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("r", 0)
        .attr("cx", function(d) { return d.s.x; })
        .attr("cy", function(d) { return d.s.y; })
        .call(drag);
  circle.transition(1000)
          .duration(500)
          .attr("r", r);

  function dragmove(d, i) {
    d3.select(this)
      .attr("cx", d.s.x = Math.max(r, Math.min(w - r, d3.event.x)))
      .attr("cy", d.s.y = Math.max(r, Math.min(h - r, d3.event.y)));
  }
}
