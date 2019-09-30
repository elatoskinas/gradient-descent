var main = function ()
{
    "use strict";

    // Initialize a Chart with x and y axis
    var chart = initializeChart('chart');

    var entryCountInput = document.getElementById("entryCountInput");

    $("#random-data-button").click(function() {
        // Get number of entries to use
        var entries = entryCountInput.value;

        // Generate some random data
        var data = getRandomData(entries, {x: 0, y: 0}, {x: 10, y: 10});
        
        // Remove all previous data
        chart.chart.selectAll("circle").remove();

        // Add the randomly generated data to the Chart
        addScatterDataToChart(chart, data);
    });
}

function initializeChart(name) {
    // Initialize margins
    var margin = {top: 25, right: 25, bottom: 25, left: 25},
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Create base Chart SVG
    var svg = d3.select("#" + name).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transorm", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear().domain([0, 10]).range([0, width]);
    svg.append("g").attr("transform", "translate(0," + width + ")")
    .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 10]).range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    return {chart: svg, xAxis: x, yAxis: y};
}

function addScatterDataToChart(chart, data) {
    chart.chart.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return chart.xAxis(d.x); })
        .attr("cy", function(d) { return chart.yAxis(d.y); })
        .attr("r", 4)
        .style("fill", "#0011bb");
}

function getRandomData(entries, min, max) {
    var result = [];

    for (var i = 0; i < entries; ++i) {
        xVal = Math.random() * (max.x - min.x) + min.x;
        yVal = Math.random() * (max.y - min.y) + min.y;
        result.push({x : xVal, y: yVal});
    }

    return result;
}

// Define entry point
$(document).ready(main);