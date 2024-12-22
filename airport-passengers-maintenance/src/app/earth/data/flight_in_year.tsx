import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Selection } from 'd3';

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

interface SeasonRange {
  start: { month: number, day: number };
  end: { month: number, day: number };
}

const seasonDateRanges: Record<string, SeasonRange> = {
  'All': { start: { month: 1, day: 1 }, end: { month: 12, day: 31 } },
  'Spring': { start: { month: 1, day: 1 }, end: { month: 3, day: 31 } },
  'Summer': { start: { month: 4, day: 1 }, end: { month: 6, day: 30 } },
  'Fall': { start: { month: 7, day: 1 }, end: { month: 9, day: 30 } },
  'Winter': { start: { month: 10, day: 1 }, end: { month: 12, day: 31 } }
};

const getSeasonFromDate = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Create a helper function to check if date falls within a range
  const isDateInRange = (month: number, day: number, range: SeasonRange): boolean => {
    const currentDate = month * 100 + day;
    const startDate = range.start.month * 100 + range.start.day;
    const endDate = range.end.month * 100 + range.end.day;
    return currentDate >= startDate && currentDate <= endDate;
  };

  // Check each season
  if (isDateInRange(month, day, seasonDateRanges.Spring)) return 'Spring';
  if (isDateInRange(month, day, seasonDateRanges.Summer)) return 'Summer';
  if (isDateInRange(month, day, seasonDateRanges.Fall)) return 'Fall';
  return 'Winter';
};

const FlightInYear: React.FC = () => {
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [year, setYear] = useState("2020");
  const [selectedState, setSelectedState] = useState("Total Network Manager Area");
  const [season, setSeason] = useState("All");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
  );

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
    const margin = { top: 60, right: 30, bottom: 70, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#line-chart").selectAll("*").remove();

    // Create SVG with responsive width
    const svg = d3.select("#line-chart")
      .append("svg")
      .attr("ref", () => svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add tooltip
    const tooltip = d3.select("#tooltip");

    // Format dates and create scales
    const parseDate = d3.timeParse("%d/%m/%Y");
    
    // Filter data based on date and season
    const filteredData = dataset.filter(d => {
      const parsedDate = parseDate(d.Day);
      if (!parsedDate) return false;
      return d.Entity === selectedState && 
        (season === 'All' || getSeasonFromDate(parsedDate) === season);
    });

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
      .range([height, 0])
      .nice(); 

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    // Add clip path
    svg.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // Create group for zooming
    const chartGroup = svg.append("g")
      .attr("clip-path", "url(#clip)");

    // X axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .attr("color", "black")
      .call(d3.axisBottom(x)
        .ticks(d3.timeDay.every(7) as d3.TimeInterval)
        .tickFormat((d: Date | d3.NumberValue) => {
          if (!(d instanceof Date)) return "";
          
          if (season === 'All') {
            const currentTicks = x.ticks(d3.timeDay.every(7) as d3.TimeInterval);
            const currentIndex = currentTicks.findIndex(tick => tick.getTime() === d.getTime());
            const prevTick = currentIndex > 0 ? currentTicks[currentIndex - 1] : null;
    
            if (prevTick) {
              const dayDiff = (d.getTime() - prevTick.getTime()) / (1000 * 60 * 60 * 24);
              if (dayDiff < 4) return "";
            }
          }

          return d3.timeFormat("%d/%m/%y")(d);
        }))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .attr("color", "black")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    // Y axis 
    svg.append("g")
      .attr("class", "y-axis")
      .attr("color", "black")
      .call(d3.axisLeft(y)
        .ticks(10)
        .tickSize(-width))
      .call(g => {
        g.select(".domain").remove();
        g.selectAll(".tick line")
          .attr("stroke", "#e0e0e0")
          .attr("stroke-dasharray", "2,2");
        g.selectAll(".tick text")
          .attr("color", "black")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .attr("dx", "-1em"); 
      });

    // Line path
    const line = d3.line<ChartDataPoint>()
      .x(d => x(d.Date))
      .y(d => y(d.Flights))
      .curve(d3.curveMonotoneX);

    chartGroup.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add interactive dots
    chartGroup.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", d => x(d.Date))
      .attr("cy", d => y(d.Flights))
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`
            Date: ${d3.timeFormat("%B %d, %Y")(d.Date)}<br/>
            Flights: ${d.Flights}
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

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

    // Zooming function
    function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
      // Update scales
      const newX = event.transform.rescaleX(x);
      
      // Update axes
      svg.select<SVGGElement>(".x-axis").call(d3.axisBottom(newX));
      
      // Update line
      chartGroup.select(".line")
        .attr("d", (d3.line<ChartDataPoint>()
          .x(d => newX(d.Date))
          .y(d => y(d.Flights))) as any
        );

      // Update dots with proper typing
      chartGroup.selectAll<SVGCircleElement, ChartDataPoint>(".dot")
        .attr("cx", function(d) { return newX(d.Date); })
        .attr("cy", function(d) { return y(d.Flights); });
    }

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
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="All">All Seasons</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
      </div>
      
      <div 
        id="line-chart" 
        className="w-full h-[600px] bg-white rounded-lg overflow-hidden"
      ></div>
      
      {/* Tooltip */}
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