// NOTE: We use the cost function of the sum of least squares:
// 1/2n * sum((w_1x + w_0) - y)^2)
// Function that runs gradient descent
var descentFunction;

var main = function ()
{
    "use strict";

    // Initialize a Chart with x and y axis
    var chart = initializeChart('chart');

    // Get inputs from forms
    var entryCountInput = document.getElementById("entryCountInput");
    var learnRateInput = document.getElementById("learnRateInput");

    var data = []

    $("#random-data-button").click(function() {
        // Get number of entries to use
        var entries = entryCountInput.value;

        // Generate some random data
        data = getRandomData(entries, {x: 0, y: 0}, {x: 10, y: 10});
        
        // Remove all previous data
        chart.chart.selectAll("circle").remove();

        // Add the randomly generated data to the Chart
        addScatterDataToChart(chart, data);
    });

    // Add onClick listener to gradient descent button to start the descent
    $("#gradient-descent-button").click(function() {
        startGradientDescent(chart, data, learnRateInput.value, 100, 1e-3);
    })
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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

function drawLine(chart, data) {
    var line = d3.line()
               .x(function(d) { return chart.xAxis(d.x); })
               .y(function(d) { return chart.yAxis(d.y); });

    chart.chart.append("path")
            .data([data])
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("class", "line");
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

function w0_part(weights, data) {
    // Partial derivative for w_0 using the least squares cost function is
    // 1/n * sum((w_1x + w_0) - y)

    var sum = 0;

    data.forEach(function(value, index, array) {
        sum += weights[1].weight * value.x + weights[0].weight - value.y;
    })

    return sum / data.length;
}

function w1_part(weights, data) {
    // Partial derivate for w_1 using least squares cost function is
    // 1/n * sum((w_1x + w_0) - y)*x

    var sum = 0;

    data.forEach(function(value, index, array) {
        sum += (weights[1].weight * value.x + weights[0].weight - value.y) * value.x;
    })

    return sum / data.length;
}

function applyGradientDescentStep(weights, learnRate, data) {
    partDerivates = [];

    weights.forEach(function(value, index, array) {
        var partialDerivative = value.part_derivative(weights, data);

        partDerivates.push(partialDerivative);

        // Calculate partial derivative for current weight, and
        // multiplpy it by the learning rate
        var descent = learnRate * partialDerivative;

        // Descend weight
        value.weight -= descent;
    });

    return partDerivates;
}

function generateDataForWeights(x, weights) {
    data = [];

    // y = ax + b = w_1x + w_0
    y0 = weights[1].weight * x.min + weights[0].weight;
    y1 = weights[1].weight * x.max + weights[0].weight;

    data.push({x: x.min, y: y0});
    data.push({x: x.max, y: y1});

    return data;
}

function applyGradientDescentOnChart(chart, weights, learnRate, data, x) {
    var partDerivatives = applyGradientDescentStep(weights, learnRate, data); // Apply gradient descent
    chart.chart.selectAll(".line").remove(); // Remove previous line
    drawLine(chart, generateDataForWeights(x, weights)); // Draw the new line
    return partDerivatives;
}

function startGradientDescent(chart, data, learnRate, nIterations, limit) {
    // Stop current recursive descent function
    clearTimeout(descentFunction)

    // Line of form: y = ax + b
    // Start with initial a = 0, b = 0
    // In order to optimize weights, we will need the partial derivatives for w_0 and w_1
    var dataObject = {}
    dataObject.chart = chart
    dataObject.data = data
    dataObject.weights = [{weight: 0, part_derivative: w0_part}, {weight: 0, part_derivative: w1_part }]
    dataObject.minmax = {min: 0, max: 10}
    dataObject.oldPartDerivatives = []

    var params = {}
    params.learnRate = learnRate
    params.nIterations = nIterations
    params.limit = limit

    recursiveDescent(0, dataObject, params)
}

function recursiveDescent(iteration, data, params) {
    var partDerivatives = applyGradientDescentOnChart(data.chart, data.weights, params.learnRate, data.data, data.minmax)

    var derivativeMaxChange = 0;

    console.log(data)

    if (data.oldPartDerivatives.length != 0) {
        partDerivatives.forEach(function(value, index, array) {
            var diff = Math.abs(array[index] - data.oldPartDerivatives[index])
            derivativeMaxChange = Math.max(derivativeMaxChange, diff);
        });
    }

    if ((derivativeMaxChange > params.limit || data.oldPartDerivatives.length == 0) && iteration < params.nIterations) {
        //descentFunction = setTimeout(func, 100);
        descentFunction = setTimeout(function() {
            data.oldPartDerivatives = partDerivates
            recursiveDescent(iteration + 1, data, params)
        }, 100)
    }
}

// Define entry point
$(document).ready(main);