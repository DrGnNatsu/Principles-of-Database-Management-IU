"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import { useEffect, useState, useMemo, useRef } from "react"

export default function Earth() {
    // ------------------------------Constants------------------------------
    const router = useRouter();
    const [selectedYear, setSelectedYear] = useState("2023");
    const [rotation, setRotation] = useState([0, 0, 0]);
    const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const width = 700;
    const height = 600;

    // ------------------------------Functions to handle the logic-----------------------------
    const handleRedirect = () => {
        router.push("/earth/data");
    };   

    const rowConverter = (d: { [x: string]: string; }) => ({
        entity: d["Entity"],
        week: d["Week"],
        day: d["Day"],
        flights: parseInt(d["Flights"], 10) || 0,
        day_2019: d["Day 2019"],
        flights_2019: parseInt(d["Flights 2019 (Reference)"], 10) || 0,
        percentage_vs_2019: parseFloat(d["% vs 2019 (Daily)"]) || 0.0,
        day_previous_year: d["Day Previous Year"],
        flights_previous_year: parseInt(d["Flights Previous Year"], 10) || 0,
    });

    // ------------------------------Functions to create the world-----------------------------
    const loadWorld = async () => {
        const data = await d3.json("/map/worldLow.geo.json");
        return data;
    };

    const projection = useMemo(() => {
        return d3.geoOrthographic()
            .scale(250)
            .translate([width / 2, height / 2]);
    }, []);

    const path = useMemo(() => {
        return d3.geoPath().projection(projection);
    }, [projection]);

    const initializeSVG = () => {
        if (!d3.select(".earth").select("svg").size()) {
            return d3.select(".earth")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("border-radius", "20px")
                .style("display", "block")
                .style("margin", "auto")
                .style("background-color", "rgba(255, 255, 255, 0.75)");
        }
        return d3.select(".earth").select("svg");
    };

    const generateColorScale = (dataset: { entity: string; flights: number }[]) => {
        // If the dataset is not an array, return an empty array
        const safeDataset = Array.isArray(dataset) ? dataset : [];
        const maxFlights = d3.max(safeDataset, (d) => d.flights) || 0;
        return d3.scaleQuantile<number, string>()
            .domain([0, maxFlights])
            .range(["#ffcc99", "#ffb366", "#ff8c1a", "#ff6600", "#cc5200", "#b34700"]);
    }

    const createEarth = async (dataset: { entity: string; flights: number }[]) => {
        const svg = initializeSVG();
        
        projection.rotate(rotation);
        
        const colorScale = generateColorScale(dataset);

        const world = await loadWorld();
        console.log(world.features.map((d: { properties: { name: any } }) => d.properties.name));
        
        // -----------------------------Add flights data from the csv file to the map json-----------------------------
        const dataFlights = d3.rollup(
            dataset,
            v => d3.sum(v, d => d.flights),
            d => d.entity
        );

        dataFlights.forEach((value, key) => {
            world.features.forEach((d: { properties: { name: any }; flights?: number }) => {
                if (d.properties.name === key) {
                    d.flights = value || 0;
                }
            });
        });
        
        world.features.forEach((d: { flights?: number }) => {
            if (d.flights === undefined) {
                d.flights = 0;
            }
        });
        // -------------------------------------------------------------------------------------------------------------

        // Print the data
        console.log(world.features.map((d: { properties: { name: any }; flights: any }) => ({ name: d.properties.name, flights: d.flights })));

        // Update or create sphere
        let sphere = svg.select(".sphere");
        if (sphere.empty()) {
            sphere = svg.append("path")
                .attr("class", "sphere")
                .datum({ type: "Sphere" })
                .attr("fill", "#2F4B7C")
                .attr("stroke", "#000");
        }
        sphere.attr("d", path);

        // Update or create countries
        let countries = svg.selectAll(".country")
            .data(world.features);

        // Enter new countries
        countries.enter()
                .append("path")
                .attr("class", "country")
                .merge(countries as any)
                .attr("d", path)
                .attr("fill", d => (d.flights ? colorScale(d.flights) : "#ffe0cc"))
                .attr("stroke", "#000")
                .on("click", clicked);

        // Remove old countries
        countries.exit().remove();

        // -----------------------------Add rotate and drag functionalities-----------------------------
        // Dragging feature
        let isDragging = false;
        let previousMousePosition: [number, number] | null = null;

        // Handle drag events
        svg.call(d3.drag()
            .on("start", (event) => {
            isDragging = true;
            previousMousePosition = [event.x, event.y];
            })
            .on("drag", (event) => {
                if (!isDragging || !previousMousePosition) return;

                const [prevX, prevY] = previousMousePosition;
                const deltaX = event.x - prevX;
                const deltaY = event.y - prevY;

                rotation[0] += deltaX * 0.5;
                rotation[1] -= deltaY * 0.5;

                projection.rotate(rotation);
                svg.selectAll("path").attr("d", path);

                setRotation([...rotation]); // Synchronize rotation state

                previousMousePosition = [event.x, event.y];
            })
            .on("end", () => {
                isDragging = false;
                previousMousePosition = null;
            })
        );
    };

    const handleRotate = (direction: string) => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const currentRotation = [...rotation];
        const targetRotation = [...rotation];
        
        if (direction === "left") {
            targetRotation[0] -= 90;
        } else if (direction === "right") {
            targetRotation[0] += 90;
        }

        const easeInOutCubic = (t: number) => {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const interpolator = d3.interpolate(currentRotation, targetRotation);
        const duration = 500;
        const startTime = Date.now();

        const svg = d3.select(".earth").select("svg");

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const rawProgress = Math.min(elapsed / duration, 1);
            const progress = easeInOutCubic(rawProgress);

            const newRotation = interpolator(progress);
            projection.rotate(newRotation);
            svg.selectAll("path").attr("d", path);

            if (rawProgress < 1) {
                const frameId = requestAnimationFrame(animate);
                setAnimationFrameId(frameId);
            } else {
                setRotation(newRotation);
            }
        };

        requestAnimationFrame(animate);
    };
    // ---------------------------------------------------------------------------

    // ------------------------------Zooming feature------------------------------
    const reset = (svg) => { 
        const resetRotation = [0, 0, 0]; // Default rotation
        projection.rotate(resetRotation); // Reset the rotation
        svg.selectAll("path").attr("d", path); // Update paths to reflect rotation reset
        
        svg.transition().duration(500).call(
            zoom.transform, 
            d3.zoomIdentity // Reset zoom transform
        );

        // Reset the color of the countries
        svg.selectAll(".country").transition().style("fill", d => (d.flights ? generateColorScale(d.flights) : "#ffe0cc"));
    }
    
    function clicked(event, d) {
        const svg = d3.select(".earth").select("svg");
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        event.stopPropagation();
        
        svg.selectAll(".country").transition().style("fill", null);
        d3.select(this).transition().style("fill", "#91ff00");
        
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
        );
    }
    
    function zoomed(event) {
        const {transform} = event;
        const svg = d3.select(".earth").select("svg");
        svg.selectAll("path").attr("transform", transform);
        svg.selectAll("path").attr("stroke-width", 1 / transform.k);
    }

    // ---------------------------------------------------------------------------
    // Load data and draw the earth
    const drawEarth = async () => {
        try {
            const data = await d3.csv(`/dataset/csv${selectedYear}.csv`, rowConverter);
            await createEarth(data);
        } catch (error) {
            console.error("Error loading CSV:", error);
        }
    };

    useEffect(() => {
        drawEarth();
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [selectedYear]);

    // Separate effect for handling rotation changes
    useEffect(() => {
        const svg = d3.select(".earth").select("svg");
        if (!svg.empty()) {
            projection.rotate(rotation);
            svg.selectAll("path").attr("d", path);
        }
    }, [rotation]);

    return (
        <div className="flex items-center justify-center h-screen flex-col mb-4 mt-10">
            <div className="flex items-center justify-center space-x-4 mb-5">
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-4 py-2 border rounded-md bg-white text-black"
                >
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                </select>

                <Button
                    onClick={handleRedirect}
                    className="
                        px-8 py-2 text-md font-medium
                        text-white bg-black rounded-md
                        hover:bg-zinc-500 hover:scale-110
                        active:bg-zinc-300 active:translate-y-1
                        transform transition duration-200
                    "
                >
                    Data
                </Button>
            </div>

            <div className="earth mb-5" ref={svgRef}></div>

            <div className="flex space-x-4 mb-20">
                <Button id="rotate-left" 
                    onClick={() => handleRotate("left")}
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Rotate Left</Button>
                <Button id="rotate-right"  
                    onClick={() => handleRotate("right")}
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Rotate Right</Button>
                <Button id="zoom-in"
                    onClick={() => d3.select(".earth").select("svg")
                        .transition()
                        .duration(500)
                        .call(zoom.scaleBy, 2.0)}
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Zoom In</Button>
                <Button id="zoom-out"
                    onClick={() => d3.select(".earth").select("svg")
                        .transition()
                        .duration(500)
                        .call(zoom.scaleBy, 0.5)
                    }   
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Zoom Out</Button>
                <Button id="reset"
                    onClick={() => {
                        const svg = d3.select(".earth").select("svg");
                        reset(svg);
                    }}
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >
                    Reset
                </Button>

            </div>
        </div>
);}