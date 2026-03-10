$("document").ready(() => {
  var response;
  $(".select.year").on("change", async function () {
    const tracks = [];
    const year = $(this).val();
    try {
      response = await axios.get(
        "https://api.openf1.org/v1/sessions?year=" + year,
      );
      const result = response.data;

      const circuitSelect = $(".select.circuit");
      circuitSelect.empty();
      circuitSelect.append(`<option value="">Circuit</option>`);
      result.forEach((session) => {
        var shortName = session.circuit_short_name;
        if (!tracks.includes(shortName)) {
          circuitSelect.append(
            `<option value="${session.circuit_short_name}">${session.circuit_short_name}</option>`,
          );
          tracks.push(shortName);
        }
      });
    } catch (error) {
      console.log(error.response.data);
    }
  });

  $(".select.circuit").on("change", async function () {
    const circuit = $(this).val();
    console.log(circuit);
    const data = response.data;

    const sessionSelect = $(".select.session");
    sessionSelect.empty();
    sessionSelect.append(`<option value="">Session</option>`);
    data.forEach((session) => {
      if (session.circuit_short_name === circuit) {
        sessionSelect.append(
          `<option value=${session.session_key}>${session.session_name}</option>`,
        );
      }
    });
  });

  $(".laps.form").on("submit", function (e) {
    e.preventDefault();

    $.post("/graph", $(this).serialize(), function (data) {
      renderGraph(data.laps, data.pits);
    });
  });

  $("#lap-reset").on("click",function(){
    svg.selectAll("*").remove();
    lineIndex = 0;
  })
});

const width = 900;
const height = 450;

const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 60,
};

const svg = d3
  .select("#laps-chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

let x = d3.scaleLinear().range([margin.left, width - margin.right]);
let y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

const color = d3.scaleOrdinal(d3.schemeCategory10);
let lineIndex = 0;

function renderGraph(lapData, pitData) {

  const pitLaps = pitData.map(p => Number(p.lap_number));

  const cleanData = lapData
    .filter(d => d.lap_number != null && d.lap_duration != null)
    .map(d => ({
      lap: Number(d.lap_number),
      time: Number(d.lap_duration)
    }))
    .filter(d => !pitLaps.includes(d.lap));

  x.domain(d3.extent(cleanData, d => d.lap));
  y.domain(d3.extent(cleanData, d => d.time));

  const line = d3.line()
    .x(d => x(d.lap))
    .y(d => y(d.time));

  const path = svg
    .append("path")
    .datum(cleanData)
    .attr("fill", "none")
    .attr("stroke", color(lineIndex))
    .attr("stroke-width", 2)
    .attr("d", line);

  const length = path.node().getTotalLength();

  path
    .attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  svg.selectAll(".points-" + lineIndex)
    .data(cleanData)
    .enter()
    .append("circle")
    .attr("class", "points-" + lineIndex)
    .attr("cx", d => x(d.lap))
    .attr("cy", d => y(d.time))
    .attr("r", 4)
    .attr("fill", color(lineIndex))
    .on("mouseover", function (event, d) {
      d3.select("#tooltip")
        .style("opacity", 1)
        .html(`Lap ${d.lap}<br>${d.time.toFixed(3)} s`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      d3.select("#tooltip").style("opacity", 0);
    });

  if (lineIndex === 0) {

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));
  }

  svg.selectAll(".pit-marker-" + lineIndex)
    .data(pitLaps)
    .enter()
    .append("line")
    .attr("class", "pit-marker-" + lineIndex)
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", margin.top)
    .attr("y2", height - margin.bottom)
    .attr("stroke", color(lineIndex))
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "6,4");

  lineIndex++;
}