// map functions

function add_states(map, state_data) {

  // add states
  map.append("g").attr('id', 'statepolygons')
    .selectAll( 'path' )
    .data(state_data.features)
    .enter()
    .append('path')
    .classed('state', true)
    .attr('id', function(d) {
      return d.properties.ID;
    })
    .attr('d', buildPath)
    .on('mouseover', highlightState)
    .on('mouseout', unhighlightState)
    .on('click', zoomTofromState);
}

// Zoom status: start at nation-wide
var activeView = 'nation';

// Style definitions (need them here instead of css to do transitions)
var stateStyle = {
  nationView: {
    active: {
      'fill': '#BEBEBE',
      'stroke': 'transparent', // looks OK white, too
      'stroke-width': 0
    },
    inactive: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // i think we're avoiding borders usually?
      'stroke-width': 0
    }
  },
  stateView: {
    active: {
      'fill': '#DCDCDC',
      'stroke': 'transparent', // no need for border when there's fill
      'stroke-width': 0
    },
    inactive: {
      'fill': 'transparent',
      'stroke': 'transparent', // could use #DCDCDC to show neighbor outlines
      'stroke-width': 0
    }
  }
};

// Function to look up a style
formatState = function(attr, d, active) {
  if(activeView == 'nation') {
    var view = 'nationView';
  } else {
    active = (d.properties.ID === activeView);
    var view = 'stateView';
  }
  if(active) {
    activeness = 'active';
  } else {
    activeness = 'inactive';
  }
  return stateStyle[view][activeness][attr];
}

// on mouseover
function highlightState() {
  d3.select(this)
    .style('fill', function(d) { return formatState('fill', d, true); })
    .style('stroke', function(d) { return formatState('stroke', d, true); })
    .style('stroke-width', function(d) { return formatState('stroke-width', d, true); });
}

// on mouseout
function unhighlightState() {
  d3.select(this)
    .style("fill", function(d) { return formatState('fill', d, false); })
    .style('stroke', function(d) { return formatState('stroke', d, false); })
    .style('stroke-width', function(d) { return formatState('stroke-width', d, false); });
}

// on click
function zoomTofromState(domElement) {
  // get the ID of the state that was clicked on (or NULL if it's not an ID).
  // could also use clickedState to set the URL, later
  clickedView = d3.select(this).attr('id');

  // determine the new view and corresponding parameters
  if(clickedView === 'map-background' || activeView != 'nation') {
    // could have made it so we go national only if they click on the background
    // or the same state: if(clickedView === 'map-background' || activeView ===
    // clickedView) {}. but instead let's always zoom out if they're in state
    // view, in if they're in nation view (and click on a state)
    activeView = 'nation';
    x = chart_width / 2;
    y = chart_height / 2;
    k = 1;
  } else {
    // if they clicked on a different state, prepare to zoom in
    activeView = clickedView;
    var centroid = buildPath.centroid(domElement);
    x = centroid[0];
    y = centroid[1];
    k = 4;
  }

  // set the styling: all states inactive for view=nation, just one state active
  // otherwise. i tried doing this with .classed('active') and
  // .classed('hidden') and css (conditional on activeView=='nation' and
  // d.properties.ID === activeView), but that didn't work with transitions.
  var states = map.selectAll('.state');
  if(activeView === 'nation') {
    states
      .transition()
      .duration(750)
      .style("fill", function(d) { return formatState('fill', d, false); })
      .style("stroke", function(d) { return formatState('stroke', d, false); })
      .style("stroke-width", function(d) { return formatState('stroke-width', d, false); });
  } else {
    states
      .transition()
      .duration(750)
      .style("fill", function(d) { return formatState('fill', d); })
      .style("stroke", function(d) { return formatState('stroke', d); })
      .style("stroke-width", function(d) { return formatState('stroke-width', d); });
  }

 // apply the transform (i.e., actually zoom in or out)
  map.transition()
    .duration(750)
    .attr('transform',
      "translate(" + chart_width / 2 + "," + chart_height / 2 + ")"+
      "scale(" + k + ")" +
      "translate(" + -x + "," + -y + ")");
}
