import React, { useState, useEffect} from 'react';
import * as d3 from 'd3';
import './bar_chart.css'

    interface DataPoint {
        Entity: string;
        Flights: number;
    }

    const barChart: React.FC = () => {
        const [dataset, setDataset] = useState<DataPoint[]>([]);
        const [year, setYear] = useState("2023");
        const [sortOrder, setSortOrder] = useState("Descending");
        const [topN, setTopN] = useState(10);

        useEffect(()=>{
            loadData(year);
        }, [year]);

        useEffect(() => {
            renderChart();
        }, [dataset, sortOrder, topN]);

        const loadData = async (selectedYear: string) => {
            try {
                const rawData = await d3.csv(`/dataset/csv${selectedYear}.csv`, (d: any) => ({
                    Entity: d.Entity as string,
                    Flights: +d.Flights,
                }));

                const filteredData = rawData.filter((d) => d.Entity && d.Entity !== "Total Network Manager Area" && !isNaN(d.Flights));

                const aggreatedData = d3.rollups(
                    filteredData,
                    (group) => d3.sum(group, d => d.Flights), //Sum Flights of each entity
                    (d) => d.Entity
                ).map(([Entity, Flights]) => ({Entity, Flights})); // Convert back to array of objects

                setDataset(aggreatedData);
                
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setYear(e.target.value);
        };
        const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSortOrder(e.target.value);
        };
        const handleTopNChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            setTopN(parseInt(e.target.value,10));
        };

        const renderChart = () => {
            // Clear previous chart
            d3.select("#bar-chart-min-max").selectAll("*").remove();

            const rankedData = [...dataset]
                                .sort((a, b) => d3.descending(a.Flights, b.Flights))
                                .map((d, index) => ({ ...d, rank: index + 1 })); // Assign rank based on descending order
       
            const sortedData = [...rankedData]
            .sort((a, b) =>
                sortOrder === "Descending" ? d3.descending(a.Flights, b.Flights) : d3.ascending(a.Flights, b.Flights)
            )
            .slice(0, topN);

            console.log("Sorted and sliced data for rendering:", sortedData);

            const margin = {top: 40, right: 20, bottom: 80, left: 70};
            const width = 1000 -margin.left-margin.right;
            const height = 500 -margin.top-margin.bottom;

            const svg = d3
                    .select("#bar-chart-min-max")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height+margin.top+margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3
                    .scaleBand()
                    .domain(sortedData.map(d => d.Entity))
                    .range([0, width])
                    .padding(0.1);

            const y = d3
                    .scaleLinear()
                    .domain([0, d3.max(sortedData, d => d.Flights) || 0])
                    .nice()
                    .range([height, 0]);
            
            {/*const colorScale = d3
                                .scaleOrdinal<string>()
                                .domain([`${d3.max(sortedData, (d) => d.Flights)}`,
                                `${d3.max(sortedData, (d) => d.Flights)! * 0.75}`,
                                `${d3.max(sortedData, (d) => d.Flights)! * 0.5}`,
                                `${d3.max(sortedData, (d) => d.Flights)! * 0.25}`,
                                "0",])
                                .range(['#2171b5','#4292c6','#6baed6','#9ecae1','#c6dbef']);*/}

            // Tooltip setup
            const tooltip = d3
            .select("#bar-chart-min-max")
            .append("div")
            .attr("class", "tooltip");
      
            // Draw bars with transition
            svg 
                .append("g")
                .selectAll("rect")
                .data(sortedData)
                .join("rect")
                .attr("x", d=> x(d.Entity)!)
                .attr("y", height) // Start from the bottom for the transition
                .attr("width", x.bandwidth())
                .attr("height", 0) // Start width height 0 for transition
                .attr("fill", '#6baed6') 
                .on("mouseover", (event, d) => {
                    const rank = rankedData.find((data) => data.Entity === d.Entity)?.rank;
                    tooltip
                        .html(`
                            <strong>${d.Entity}</strong><br>Total Flights: ${d.Flights}<br>Rank: ${rank}
                        `)
                        .style("opacity", 1)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 20}px`);
                })
                .on("mousemove", (event) => {
                    tooltip
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 20}px`);
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0);
                })
                .transition()
                .duration(800)
                .attr("y", d => y(d.Flights))
                .attr("height", d => height - y(d.Flights));


            svg 
                .append("g")
                .attr("class", "x-axis")
                .attr("color", "black")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style('font-size', '12px')
                .attr("color", "black")
                .style('font-weight','bold')
                .style("text-anchor", "end");

            svg
                .append("g")
                .attr("class", "y-axis")
                .style('font-weight','bold')
                .style('font-size', '12px')
                .attr("color", "black")
                .call(d3.axisLeft(y).ticks(10));

        };

    return(
        <div>
            <h2 className="text-3xl font-semibold mb-4 text-center text-black">
                The total of flights across European countries in {year}
            </h2>
            <p className="mb-6 text-center text-gray-600">
                Explore flight trends across European countries by selecting the desired year, sorting order, then choosing the top countries to show. 
            </p>
            {/* Controls container */}
            <div className="controls">
                <div className="control">
                    <label htmlFor="year">Year of Data:</label>
                    <select
                        id="year"
                        value={year}
                        onChange={handleYearChange}
                        className="dropdown"
                    >
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                    </select>
                </div>

                <div className="control">
                    <label htmlFor="sortOrder">Sort Order:</label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={handleSortOrderChange}
                        className="dropdown"
                    >
                        <option value="Ascending">Ascending</option>
                        <option value="Descending">Descending</option>
                    </select>
                </div>

                <div className="control">
                    <label htmlFor="topN">Show Top:</label>
                    <select
                        id="topN"
                        value={topN}
                        onChange={handleTopNChange}
                        className="dropdown"
                    >
                        <option value={10}>Top 10</option>
                        <option value={20}>Top 20</option>
                        <option value={42}>All</option>
                    </select>
                </div>

            </div>

            {/* Bar chart container */}
            <div id="bar-chart-min-max" />
        </div>

    );
}

export default barChart;



    