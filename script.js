let svg, x, y, line, g, width, height, margin;
const epsilonStart = 1.0;
const epsilonEnd = 0.1;
const numFrames = 100;
let frame = 0;
let func, xApproach, limitValue;

function init() {
    svg = d3.select("svg");
    margin = {top: 20, right: 20, bottom: 30, left: 50};
    width = +svg.attr("width") - margin.left - margin.right;
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));
}

function startAnimation() {
    const functionInput = document.getElementById("functionInput").value;
    xApproach = parseFloat(document.getElementById("xValueInput").value);
    limitValue = parseFloat(document.getElementById("limitValueInput").value);
    try {
        func = new Function("x", `return ${functionInput}`);
        frame = 0;
        g.selectAll("*").remove();
        drawGraph();
        update();
    } catch (e) {
        alert("유효하지 않은 함수입니다. 올바른 JavaScript 표현식을 입력하세요.");
    }
}

function drawGraph() {
    const data = d3.range(xApproach - 1.5, xApproach + 1.6, 0.1).map(x => ({x: x, y: func(x)}));

    x.domain(d3.extent(data, d => d.x));
    y.domain([d3.min(data, d => d.y), d3.max(data, d => d.y)]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
}

function update() {
    const epsilon = epsilonStart - frame * (epsilonStart - epsilonEnd) / numFrames;
    const fa = limitValue;
    const delta = Math.sqrt(epsilon / 5); // 근사치로 delta 계산
    
    const f_xApproach = func(xApproach);
    const isCorrectLimit = Math.abs(f_xApproach - limitValue) < epsilonEnd;

    g.selectAll(".epsilon-line").remove();
    g.selectAll(".delta-line").remove();
    g.selectAll(".epsilon-area").remove();
    g.selectAll(".delta-area").remove();

    g.append("line")
        .attr("class", "epsilon-line")
        .attr("x1", 0)
        .attr("y1", y(fa + epsilon))
        .attr("x2", width)
        .attr("y2", y(fa + epsilon))
        .attr("stroke", "green")
        .attr("stroke-dasharray", "5,5");

    g.append("line")
        .attr("class", "epsilon-line")
        .attr("x1", 0)
        .attr("y1", y(fa - epsilon))
        .attr("x2", width)
        .attr("y2", y(fa - epsilon))
        .attr("stroke", "green")
        .attr("stroke-dasharray", "5,5");

    g.append("line")
        .attr("class", "delta-line")
        .attr("x1", x(xApproach + delta))
        .attr("y1", 0)
        .attr("x2", x(xApproach + delta))
        .attr("y2", height)
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "5,5");

    g.append("line")
        .attr("class", "delta-line")
        .attr("x1", x(xApproach - delta))
        .attr("y1", 0)
        .attr("x2", x(xApproach - delta))
        .attr("y2", height)
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "5,5");

    g.append("rect")
        .attr("class", "epsilon-area")
        .attr("x", 0)
        .attr("y", y(fa + epsilon))
        .attr("width", width)
        .attr("height", y(fa - epsilon) - y(fa + epsilon))
        .attr("fill", "green")
        .attr("opacity", 0.1);

    g.append("rect")
        .attr("class", "delta-area")
        .attr("x", x(xApproach - delta))
        .attr("y", 0)
        .attr("width", x(xApproach + delta) - x(xApproach - delta))
        .attr("height", height)
        .attr("fill", "blue")
        .attr("opacity", 0.1);

    if (frame < numFrames) {
        frame++;
        requestAnimationFrame(update);
    } else {
        if (isCorrectLimit) {
            alert("올바른 극한 값입니다.");
        } else {
            alert("틀린 극한 값입니다.");
        }
    }
}

document.addEventListener("DOMContentLoaded", init);
