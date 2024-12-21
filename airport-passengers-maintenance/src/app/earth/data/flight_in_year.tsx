import React, { useState, useEffect } from "react";
import * as d3 from "d3";

interface DataPoint {
  Entity: string;
  Week: number;
  Day: string;
  Flights: number;
}

interface ChartDataPoint extends DataPoint {
  Date: Date;
}

const loadDataForYear = async (selectedYear: string) => {
  try {
    console.log(`Loading data for year: ${selectedYear}`);
    
    const response = await fetch(`/dataset/csv${selectedYear}.csv`);
    const csvText = await response.text();
    
    // Parse CSV data
    const rows = csvText.split('\n');
    const data: DataPoint[] = [];
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (row.length >= 4) {
        // Parse date to ensure correct format
        const dateStr = row[2].trim();
        // Validate date format
        if (isValidDate(dateStr)) {
          const dataPoint: DataPoint = {
            Entity: row[0].trim(),
            Week: parseInt(row[1]),
            Day: dateStr,
            Flights: parseInt(row[3])
          };
          data.push(dataPoint);
          
          console.log(`Parsed data point:`, {
            Entity: dataPoint.Entity,
            Week: dataPoint.Week,
            Day: dataPoint.Day,
            Flights: dataPoint.Flights
          });
        }
      }
    }
    
    console.log(`Total rows loaded: ${data.length}`);
    return data;
    
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

// Date validation helper
const isValidDate = (dateStr: string): boolean => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const valid = date && date.getDate() === day;
  
  if (!valid) {
    console.warn(`Invalid date found: ${dateStr}`);
  }
  
  return valid;
};

// Add season to week mapping
const seasonWeekMap: { [key: string]: [number, number] } = {
  'Spring': [1, 13],
  'Summer': [14, 26],
  'Fall': [27, 39],
  'Winter': [40, 52]
};

const FlightInYear: React.FC = () => {
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [year, setYear] = useState("2020");
  const [selectedState, setSelectedState] = useState("Albania");
  const [season, setSeason] = useState("Spring");

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for year:', year);
      const loadedData = await loadDataForYear(year);
      if (loadedData.length > 0) {
        setDataset(loadedData);
        console.log('Data loaded successfully:', loadedData.slice(0, 5));
      } else {
        console.error('No data loaded for year:', year);
      }
    };

    fetchData();
  }, [year]); // Re-run when year changes

  useEffect(() => {
    if (!dataset.length) return;

    // Get container width
    const container = d3.select("#line-chart").node() as HTMLElement;
    const containerWidth = container.getBoundingClientRect().width;

    // Chart setup with responsive width
    const margin = { top: 60, right: 30, bottom: 80, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#line-chart").selectAll("*").remove();

    // Create SVG with responsive width
    const svg = d3.select("#line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add tooltip
    const tooltip = d3.select("#tooltip");

    // Format dates and create scales
    const parseDate = d3.timeParse("%d/%m/%Y");
    const [seasonStart, seasonEnd] = seasonWeekMap[season];
    const filteredData = dataset.filter(d => 
      d.Entity === selectedState && 
      d.Week >= seasonStart && 
      d.Week <= seasonEnd
    );
    const data: ChartDataPoint[] = filteredData
      .map(d => {
        const parsedDate = parseDate(d.Day);
        if (!parsedDate) return null;
        
        return {
          ...d,
          Date: parsedDate
        };
      })
      .filter((d): d is ChartDataPoint => d !== null)
      .sort((a, b) => a.Date.getTime() - b.Date.getTime());

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Flights) || 0])
      .range([height, 0]);

    // Add X axis with larger text
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .attr("color", "black")
      .call(d3.axisBottom(x)
        .ticks(d3.timeDay.every(7)) // Show weekly ticks
        .tickFormat((d) => d3.timeFormat("%d/%m/%Y")(d as Date)))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .attr("color", "black")
        .style("font-size", "14px");

    // Add Y axis with black color and grid, without top border
    svg.append("g")
      .attr("class", "y-axis")
      .attr("color", "black")
      .call(d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width))
      .call(g => {
        // Remove domain path (removes the axis line)
        g.select(".domain").remove();
        // Style grid lines
        g.selectAll(".tick line")
          .attr("stroke", "#e0e0e0")
          .attr("stroke-dasharray", "2,2");
        // Style tick text
        g.selectAll(".tick text")
          .attr("color", "black")
          .style("font-size", "14px");
      });

    // Add line path
    const line = d3.line<ChartDataPoint>()
      .x(d => x(d.Date))
      .y(d => y(d.Flights))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add interactive dots
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.Date))
      .attr("cy", d => y(d.Flights))
      .attr("r", 4)
      .style("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 0.9)
          .style("display", "block")
          .style("background-color", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "6px")
          .style("font-size", "16px")
          .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .html(`
            <div style="font-size: 16px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${d.Entity}</div>
              <div>Date: <strong>${d.Day}</strong></div>
              <div>Flights: <strong>${d.Flights}</strong></div>
            </div>
          `);

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8)
          .style("fill", "#ff4444");
      })
      .on("mouseout", (event) => {
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0)
          .style("display", "none");
      
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 4)
          .style("fill", "steelblue");
      });

    // Add X axis label with adjusted position
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 10) // Adjusted position
      .text("Date")
      .style("font-size", "16px")
      .style("fill", "black")
      .style("font-weight", "bold");

    // Add Y axis label
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height/2)
      .text("Number of Flights")
      .style("font-size", "16px")
      .style("font-weight", "bold");

  }, [dataset, selectedState, season]); // Add season to dependencies

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
        
        {/* Year Selection */}
        <div className="flex flex-col items-center">
          <label htmlFor="year-selection" className="mb-2 text-lg font-medium text-black">
            Year of Data:
          </label>
          <select
            id="year-selection"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>

        {/* State Selection */}
        <div className="flex flex-col items-center">
          <label htmlFor="state-selection" className="mb-2 text-lg font-medium text-black">
            State:
          </label>
          <select
            id="state-selection"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          >
            {[...new Set(dataset.map((d) => d.Entity))].map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Season Selection */}
        <div className="flex flex-col items-center">
          <label htmlFor="season-selection" className="mb-2 text-lg font-medium text-black">
            Season:
          </label>
          <select
            id="season-selection"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
      </div>

      <div 
        id="line-chart" 
        className="w-full h-[500px] bg-white rounded-lg overflow-hidden"
      ></div>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          background: "#fff",
          border: "1px solid #ccc",
          padding: "5px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
        className="text-black"
      ></div>
    </div>
  );
};

export default FlightInYear;