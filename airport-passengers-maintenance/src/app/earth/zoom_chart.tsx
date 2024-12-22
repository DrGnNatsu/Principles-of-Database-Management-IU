"use client";
import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Link from 'next/link';
import { ChartBarIcon } from '@heroicons/react/24/outline';

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
    const response = await fetch(`/dataset/csv${selectedYear}.csv`);
    const csvText = await response.text();
    const rows = csvText.split('\n');
    const data: DataPoint[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      if (row.length >= 4) {
        const dateStr = row[2].trim();
        if (isValidDate(dateStr)) {
          const dataPoint: DataPoint = {
            Entity: row[0].trim(),
            Week: parseInt(row[1]),
            Day: dateStr,
            Flights: parseInt(row[3])
          };
          data.push(dataPoint);
        }
      }
    }
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

const isValidDate = (dateStr: string): boolean => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date && date.getDate() === day;
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

  if (isDateInRange(month, day, seasonDateRanges.Spring)) return 'Spring';
  if (isDateInRange(month, day, seasonDateRanges.Summer)) return 'Summer';
  if (isDateInRange(month, day, seasonDateRanges.Fall)) return 'Fall';
  return 'Winter';
};

const isDateInRange = (month: number, day: number, range: SeasonRange): boolean => {
  const currentDate = month * 100 + day;
  const startDate = range.start.month * 100 + range.start.day;
  const endDate = range.end.month * 100 + day;
  return currentDate >= startDate && currentDate <= endDate;
};

const ZoomChart: React.FC = () => {
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [year, setYear] = useState("2023");
  const [season, setSeason] = useState("All");
  const [selectedState, setSelectedState] = useState<string>('Total Network Manager Area');

  useEffect(() => {
    const fetchData = async () => {
      const loadedData = await loadDataForYear(year);
      if (loadedData.length > 0) {
        setDataset(loadedData);
      }
    };
    fetchData();
  }, [year]);

  useEffect(() => {
    if (!dataset.length) return;

    // Setup
    const container = d3.select("#zoom-chart").node() as HTMLElement;
    const containerWidth = container.getBoundingClientRect().width;
    const margin = { top: 60, right: 30, bottom: 70, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#zoom-chart").selectAll("*").remove();

    // Create SVG
    const svg = d3.select("#zoom-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse and filter data
    const parseDate = d3.timeParse("%d/%m/%Y");

    const filteredData = dataset.filter(d => {
        const parsedDate = parseDate(d.Day);
      
        if (!parsedDate) return false;

        // Filter data by date range

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
        } as ChartDataPoint;
      })
      .filter((d): d is ChartDataPoint => d !== null)
      .sort((a, b) => a.Date.getTime() - b.Date.getTime());

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.Day))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Flights) || 0])
      .range([height, 0])
      .nice();

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickFormat((d, i) => i % 7 === 0 ? d as string : ''))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("color", "black")
      .style("font-weight", "bold")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px");

    // Add Y axis
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

    // Create bars
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Day) || 0)
      .attr("y", d => y(d.Flights))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.Flights))
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("#tooltip");
        
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", "#ff4444");

        tooltip
          .style("display", "block")
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .html(`
            <div>
              <div style="font-weight: bold; margin-bottom: 5px;">${d.Entity}</div>
              <div>Date: ${d.Day}</div>
              <div>Flights: ${d.Flights.toLocaleString()}</div>
            </div>
          `);
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", "steelblue");

        d3.select("#tooltip")
          .style("display", "none");
      });

    // Define zoom behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([1, 8])  // Adjust min/max zoom
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        // Apply transformation
        const { transform } = event;
        // Update x scale
        const newX = transform.rescaleX(x);
        // Update bars
        svg.selectAll(".bar")
          .attr("x", (d: ChartDataPoint) => newX(d.Day) || 0)
          .attr("width", newX.bandwidth ? newX.bandwidth() : (x.bandwidth() * transform.k));

        // Update X axis
        svg.select<SVGGElement>(".x-axis")
          .call(d3.axisBottom(newX)
            .tickFormat((d, i) => i % 7 === 0 ? (d as string) : ''));
      });

    // Add a rectangle to capture zoom events
    svg.append("rect")
      .attr("class", "zoom-rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(zoomBehavior as any);

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`Flight Count for ${selectedState}`);

  }, [dataset, selectedState, season]);

  return (
    <div className="w-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-black text-center">
        Number of Flights in {year}
      </h2>
      
      <div className="mb-6 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex flex-col items-center">
          <label htmlFor="year-selection" className="mb-2 text-lg font-medium text-black">
            Year of Data:
          </label>
          <select
            id="year-selection"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-[42px] px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <div className="flex flex-col items-center">
          <label htmlFor="state-selection" className="mb-2 text-lg font-medium text-black">
            State:
          </label>
          <select
            id="state-selection"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-[42px] px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
          >
            {[...new Set(dataset.map((d) => d.Entity))].map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

        </div>

        <div className="flex flex-col items-center">
          <label htmlFor="season-selection" className="mb-2 text-lg font-medium text-black">
            Season:
          </label>
          <select
            id="season-selection"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="h-[42px] px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
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
        id="zoom-chart" 
        className="w-full h-[600px] bg-white rounded-lg overflow-hidden"
      ></div>
      
      <div className="flex justify-center mb-4 mt-6">
        <Link 
            href="/earth/data"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
        >
            <ChartBarIcon className="w-5 h-5" />
            <span>VIEW DAILY TRAFFIC DASHBOARD</span>
        </Link>
      </div>

      <div 
        id="tooltip" 
        style={{
          position: "absolute",
          display: "none",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "4px",
          fontSize: "14px",
          pointerEvents: "none",
          zIndex: 100,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      ></div>
    </div>
  );
};

export default ZoomChart;