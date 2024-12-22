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
    const endDate = range.end.month * 100 + day;
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
  
  const [year, setYear] = useState("2023");
  const [season, setSeason] = useState("All");
  
  const [compareMode, setCompareMode] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('Total Network Manager Area');
  const [addedStates, setAddedStates] = useState<string[]>([]);

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
      return (compareMode ? addedStates.includes(d.Entity) : d.Entity === selectedState) && 
        (season === 'All' || getSeasonFromDate(parsedDate) === season);
    });

    const data: ChartDataPoint[] = filteredData
      .map(d => {
        const parsedDate = parseDate(d.Day);
        if (!parsedDate) return null;
        
        return {
          ...d,
          Date: parsedDate
        } as ChartDataPoint;
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

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Group data by country
    const dataByCountry = d3.group(filteredData, d => d.Entity);

    // Create lines for each state
    dataByCountry.forEach((stateData, state) => {
      const path = svg.append("path")
        .datum(stateData)
        .attr("class", `line-${state.replace(/\s+/g, '-')}`)
        .attr("fill", "none")
        .attr("stroke", colorScale(state))
        .attr("stroke-width", 2)
        .attr("d", line as any);

      // Add line animation
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    });

    // Add interactive dots
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.Date))
      .attr("cy", d => y(d.Flights))
      .attr("r", season === 'All' ? 4 : 6)
      .style("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .transition()
          .duration(200)
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
          d3.select("#tooltip").html(`
            <div style="font-size: 16px;">
              <div style="font-weight: bold; margin-bottom: 5px;">${d.Entity}</div>
              <div>Date: <strong>${d.Day}</strong></div>
              <div>Flights: <strong>${d.Flights}</strong></div>
            </div>
          `);

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 9)
          .style("fill", "#ff4444");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
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
          .attr("r", season === 'All' ? 4 : 6)
          .style("fill", "steelblue");
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


    // After data filtering and before line creation
    const dataByState = d3.group(data, d => d.Entity);

    // Line generator definition
    const lineGenerator = d3.line<ChartDataPoint>()
      .x(d => x(d.Date))
      .y(d => y(d.Flights))
      .curve(d3.curveMonotoneX);

    // Create lines for each state
    dataByState.forEach((stateData, state) => {
      const path = svg.append("path")
        .datum(stateData)
        .attr("class", `line-${state.replace(/\s+/g, '-')}`)
        .attr("fill", "none")
        .attr("stroke", colorScale(state))
        .attr("stroke-width", season === 'All' ? 1 : 3)
        .attr("d", lineGenerator);

      // Add line animation
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    });

  }, [dataset, selectedState, addedStates, season, compareMode]); // Add season to dependencies

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-black text-center">Number of Flights in {year}</h2>
      <p className="text-md text-center text-gray-600 mb-4">
        This chart displays the total number of flights across different dates.
      </p>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCompareMode(!compareMode)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {compareMode ? 'Disable Compare Mode' : 'Enable Compare Mode'}
        </button>
      </div>
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
          <div className="flex gap-2 h-[42px]"> {/* Set fixed height container */}
            <select
              id="state-selection"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-full px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            >
              <option value="">Select a state</option>
              {[...new Set(dataset.map((d) => d.Entity))].map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {compareMode && (
              <button
                onClick={() => {
                  if (selectedState && !addedStates.includes(selectedState)) {
                    setAddedStates([...addedStates, selectedState]);
                  }
                }}
                className="h-full px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add State
              </button>
            )}
          </div>
          
          {compareMode && (
            <div className="mt-2 flex flex-wrap gap-2">
              {addedStates.map(state => (
                <div key={state} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <span>{state}</span>
                  <button
                    onClick={() => setAddedStates(addedStates.filter(s => s !== state))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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