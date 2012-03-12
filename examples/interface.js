/// Copyright by Erik Weitnauer, 2012.

/// This file is for creating an interface that lets the user manipulate
/// the values of parameters. It uses d3 and the range widget of jquery.
/// The parameters are passed in the following format:
/// { ID1: {value: 0.1, range:[0,1], label: "param1", postfix: " meters"}
///  ,ID2: {value: 10, values:[1,10,100,1000]}
///  ...
/// }
/// 'value' is the initial value of the parameter
/// The value range is either given by 'range:[min,max]' or by a list of allowed
/// values 'values:[x1,...,xn]'. Optinally, a label and a postfix, that is
/// displayed behind the value can be passed.

/// Creates an array from a passed parameter hash. The array can be used as
/// data for d3 selections.
/// For parameters with a given list of values, the index of the current value
/// is written to 'idx'. The ids of the parameters are written to 'id'.
function create_param_array(param_hash) {
  var a = [];
  for (var id in param_hash) {
    var p = param_hash[id];
    p.id = id;
    p.step = p.step || 1;
    if ('values' in p) {
      p.idx = p.values.indexOf(p.value);
      p.range = [0, p.values.length-1];
      p.step = 1; 
    } else {
      p.idx = p.value;
    }
    a.push(p);
  }
  return a;
}

function addSimulationControls(play_fn, pause_fn, step_fn, stop_fn) {
  // animation on hover
  $('#dialog_link, ul#icons li').hover(
	  function() { $(this).addClass('ui-state-hover'); }, 
	  function() { $(this).removeClass('ui-state-hover'); }
  );
  // add play button
  $('#play').click(function(evt) {
    evt.preventDefault();
    var sp = $("#play span");
    if (sp.hasClass('ui-icon-play')) {
      sp.removeClass('ui-icon-play');
      sp.addClass('ui-icon-pause');
      $("#play").addClass('ui-state-active');
      play_fn();
    } else {
      sp.removeClass('ui-icon-pause');
      sp.addClass('ui-icon-play');
      $("#play").removeClass('ui-state-active');
      pause_fn();
    }
  });
  // add step button
  $("#step").click(function(evt) {
    evt.preventDefault();
    step_fn();
  });
  // add stop button
  $("#stop_movement").click(function(evt) {
    evt.preventDefault();
    stop_fn();
  });
}


function addParamControls(parent_element, params, update_fn) {
  var update_params = function() {
    d3.selectAll("div.parameter")
    .data(param_array)
    .select("span")
    .text(function(d) {
      if ('values' in d) d.value = d.values[d.idx]
      else d.value = d.idx;  
      var str = ('postfix' in d) ? d.postfix : '';
      return d.value + str;
    });
    update_fn();
  }
  
  var number_drag = d3.behavior.drag()
   .on("drag", function(d) {
      d3.event.sourceEvent.preventDefault();
      this.__dx__ += d3.event.dx;
      var upp = Math.min(20,(d.range[1]-d.range[0])/300);
      var du = d.step*Math.round(upp*this.__dx__/d.step);
      var new_val = Math.max(d.range[0],Math.min(d.idx+du, d.range[1]));
      if (new_val != d.idx) {
        d.idx = Number(new_val.toFixed(8));
        this.__dx__ = 0;
        update_params();
      }
    })
   .on("dragstart", function(d) {
      d3.select(this).classed('active', true);
      d3.event.sourceEvent.preventDefault();
      this.__dx__ = 0;
    })
   .on("dragend", function(d) {
      d3.select(this).classed('active', false);
      d3.event.sourceEvent.preventDefault();
      delete this.__dx__;
    });

  var param_array = create_param_array(params);
    
  // add sliders for all parameters
  var divs = d3.select(parent_element).selectAll("div.parameter")
    .data(param_array).enter()
    .append("div")
    .attr("class", "parameter");
  
  divs.append("p")
    .text(function(d) { return (d.label || d.id) + ': ' })
    .append("span")
    .attr("class", function(d) { return d.type=='fixed' ? "" : "changable" })
    .style("cursor", function(d) { return d.type=='number' ? "ew-resize" : null});
  
  d3.selectAll("span.changable")
    .call(number_drag);
  
  divs.append("div")
    .each(function(d) {
      if (d.type=='fixed' || d.type=='number') return;
      // slider type (=default type)
      $(this).slider({
        min: 'range' in d ? d.range[0] : 0
       ,max: 'range' in d ? d.range[1] : d.values.length-1
       ,value: d.idx
       ,step: (d.step || 1)
       ,slide: function(evt, ui) {
          d.idx = ui.value;
          update_params(); }
      });
    });
 
  update_params();
};

