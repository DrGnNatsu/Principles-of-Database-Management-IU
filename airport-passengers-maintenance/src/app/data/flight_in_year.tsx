import React, { useState, useEffect } from "react";
import * as d3 from "d3";

// Define the structure of a data point
interface DataPoint {
  Entity: string;
  Week: number;
  Day: string;
  Flights: number;
}

const FlightInYear: React.FC = () => {
  const [dataset, setDataset] = useState<DataPoint[]>([]); // Holds data for the selected year
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]); // Data after filtering
  const [year, setYear] = useState("2020"); // Selected year
  const [selectedState, setSelectedState] = useState("All");
  const [season, setSeason] = useState("All");
  const [dateRange, setDateRange] = useState<[string, string]>([
    "1/1/2020",
    "12/31/2020",
  ]);

  useEffect(() => {
    const newDateRange: [string, string] =
      year === "2020"
        ? ["1/1/2020", "12/31/2020"]
        : year === "2021"
        ? ["1/1/2021", "12/31/2021"]
        : year === "2022"
        ? ["1/1/2022", "12/31/2022"]
        : ["1/1/2023", "12/31/2023"];
    setDateRange(newDateRange);
  }, [year]);

  // Load data when the year changes
  useEffect(() => {
    loadData(year);
  }, [year]);

  // Reapply filters whenever dataset or filter options change
  useEffect(() => {
    applyFilters();
  }, [dataset, selectedState, season, dateRange]);

  // Update the chart whenever filtered data changes
  useEffect(() => {
    renderChart();
  }, [filteredData]);

  const loadData = async (selectedYear: string) => {
    try {
      console.log(`Loading data for year: ${selectedYear}`);
      const rawData = await d3.csv(
        `/dataset/csv${selectedYear}.csv`,
        (d: any) => ({
          Entity: d.Entity as string,
          Week: +d.Week,
          Day: d.Day as string,
          Flights: +d.Flights,
        })
      );

      console.log("Data loaded successfully:", rawData);
      setDataset(rawData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const applyFilters = () => {
    let data = dataset;

    if (selectedState !== "All") {
      data = data.filter((d) => d.Entity === selectedState);
    }

    if (season !== "All") {
      const seasonMonths =
        {
          Spring: [1, 2, 3],
          Summer: [4, 5, 6],
          Fall: [7, 8, 9],
          Winter: [10, 11, 12],
        }[season] || [];
      data = data.filter((d) =>
        seasonMonths.includes(new Date(d.Day).getMonth() + 1)
      );
    }

    const [startDate, endDate] = dateRange.map((d) => new Date(d));
    data = data.filter((d) => {
      const date = new Date(d.Day);
      return date >= startDate && date <= endDate;
    });

    setFilteredData(data); // Update filtered data
  };

  const renderChart = () => {
    // Clear previous chart
    d3.select("#bar-chart-flight-in-year").selectAll("*").remove();

    const margin = { top: 40, right: 20, bottom: 100, left: 50 };
    const width = 1500 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3
      .select("#bar-chart-flight-in-year")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(50,${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.Day))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.Flights) || 0])
      .nice()
      .range([height, 0]);

    const zoom = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event: any) {
      const transform = event.transform;

      const newRange = [0, width].map((d) => transform.applyX(d));
      const newX = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.Day))
        .range(newRange as [number, number])
        .padding(0.1);

      // Update the x-axis with the new scale
      svg
        .select<SVGGElement>(".x-axis") // Cast to <g> element
        .call(d3.axisBottom(newX));

      // Update bars
      const bars = svg.selectAll<SVGRectElement, DataPoint>(".bar");
      bars.attr("x", (d) => newX(d.Day)!).attr("width", newX.bandwidth());
    }

    // Bars logic
    svg
      .selectAll("rect")
      .data(filteredData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Day)!)
      .attr("y", (d) => y(d.Flights))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.Flights))
      .attr("fill", "#2171b5")
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .style("display", "block")
          .html(`<strong>${d.Day}</strong><br/>Flights: ${d.Flights}`);
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("display", "none");
      });

    // Axis logic
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(`Flight Data from ${dateRange[0]} to ${dateRange[1]}`);
  };

  return (
    <div className="w-full flex gap- flex-col">
      <div className="">
        <label className="text-black ">
          Select Year:
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="text-black"
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </label>
        <label className="text-black">
          Select State:
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-black"
          >
            <option value="All">All</option>
            {[...new Set(dataset.map((d) => d.Entity))].map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="text-black">
          Select Season:
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="text-black"
          >
            <option value="All">All</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </label>
      </div>
      <div className="flex  text-black" id="bar-chart-flight-in-year"></div>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          background: "#fff",
          border: "1px solid #ccc",
          padding: "5px",
        }}
        className="text-black"
      ></div>
    </div>
  );
};

export default FlightInYear;
