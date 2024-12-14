import React, { useState, useEffect } from "react";
import * as d3 from "d3";

interface DataPoint {
  Entity: string;
  Week: number;
  Day: string;
  Flights: number;
}

const FlightInYear: React.FC = () => {
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);
  const [year, setYear] = useState("2020");
  const [selectedState, setSelectedState] = useState("");
  const [season, setSeason] = useState("Spring");
  const [dateRange, setDateRange] = useState<[string, string]>([
    "01/01/2020",
    "31/12/2020",
  ]);

  useEffect(() => {
    if (dataset.length > 0 && selectedState === "") {
      const firstState = [...new Set(dataset.map((d) => d.Entity))][0];
      setSelectedState(firstState);
    }
  }, [dataset]);

  useEffect(() => {
    const newDateRange: [string, string] =
      year === "2020"
        ? ["01/01/2020", "31/12/2020"]
        : year === "2021"
          ? ["01/01/2021", "31/12/2021"]
          : year === "2022"
            ? ["01/01/2022", "31/12/2022"]
            : ["01/01/2023", "31/12/2023"];
    setDateRange(newDateRange);
  }, [year]);

  useEffect(() => {
    loadData(year);
  }, [year]);

  useEffect(() => {
    applyFilters();
  }, [dataset, selectedState, season, dateRange]);

  useEffect(() => {
    renderChart();
  }, [filteredData]);

  const loadData = async (selectedYear: string) => {
    try {
      console.log(`Loading data for year: ${selectedYear}`);
      const rawData = await d3.csv(
        `/dataset/csv${selectedYear}.csv`,
        (d: any) => {
          // Convert date from m/d/yyyy to dd/mm/yyyy
          const date = new Date(d.Day);
          const formattedDay = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          return {
            Entity: d.Entity as string,
            Week: +d.Week,
            Day: formattedDay,
            Flights: +d.Flights,
          };
        }
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

      data = data.filter((d) => {
        const [day, month] = d.Day.split('/').map(Number);
        return seasonMonths.includes(month);
      });
    }

    const [startDate, endDate] = dateRange.map((d) => {
      const [day, month, year] = d.split('/').map(Number);
      return new Date(year, month - 1, day);
    });

    data = data.filter((d) => {
      const [day, month, year] = d.Day.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date >= startDate && date <= endDate;
    });

    // Sort data by date (Day) in ascending order
    data.sort((a, b) => {
      const dateA = new Date(a.Day.split('/').reverse().join('-')); // Convert to yyyy-mm-dd format
      const dateB = new Date(b.Day.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredData(data);
  };

  const renderChart = () => {
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
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
        [-margin.left, -margin.top],
        [width + margin.right, height + margin.bottom]
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

      svg
        .select<SVGGElement>(".x-axis")
        .call(d3.axisBottom(newX));

      svg.selectAll<SVGRectElement, DataPoint>(".bar")
        .attr("x", (d) => newX(d.Day) || 0)
        .attr("width", newX.bandwidth());
    }

    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const barsGroup = svg.append("g")
      .attr("clip-path", "url(#clip)");

    barsGroup
      .selectAll("rect")
      .data(filteredData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Day) || 0)
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

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

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
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </label>
      </div>
      <div className="flex text-black" id="bar-chart-flight-in-year"></div>
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