"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";

export default function Earth() {
    const router = useRouter();
    const [selectedYear, setSelectedYear] = useState("2023");
    const [scale, setScale] = useState(1);
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 8;
    const [targetScale, setTargetScale] = useState(1);
    let animationFrameId: number | null = null;

    let projection: d3.GeoStreamWrapper | null | undefined = null; // Declare projection globally
    let render: ((country: any, arc: any) => HTMLCanvasElement) | ((arg0: null) => void) | null = null; // Declare render globally

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

    const loadWorld = async () => {
        const data = await d3.json("/map/world.json"); // Ensure correct path
        return data;
    };

    const smoothZoom = (targetScale: number) => {
        const startScale = scale;
        const startTime = Date.now();
        const ZOOM_TRANSITION_DURATION = 300;

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / ZOOM_TRANSITION_DURATION, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentScale = startScale + (targetScale - startScale) * easeProgress;

            setScale(currentScale);
            if (projection) projection.scale(currentScale * 250); // Use global projection
            if (render) render(null); // Use global render function

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    const debounce = (func: { (event: any): void; (arg0: any): void; }, wait: number | undefined) => {
        let timeout: string | number | NodeJS.Timeout | undefined;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const createEarth = async (dataset: Iterable<unknown>) => {
        d3.select(".earth canvas").remove();
        console.log(dataset)
        const world = await loadWorld();
        const land = topojson.feature(world, world.objects.land);
        const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
        

        console.log(world.objects.countries.geometries.map((d: { id: any; properties: { name: any; }; }) => d.properties.name))


        const width = 900;
        const height = 600;
        const dpr = window.devicePixelRatio ?? 1;

        const colorScale = d3.scaleLinear()
                            .range(["#f7f7f7", "#ff4444"])
                            .domain([0, d3.max(dataset, (d) => d.flights)])
        

        const canvas = d3.create("canvas")
            .attr("width", width * dpr)
            .attr("height", height * dpr)
            .style("width", `${width}px`)
            .style("height", `${height}px`)
            .style("display", "block")
            .style("border-radius", "20px")
            .classed("m-auto block", true);

        const context = canvas.node()?.getContext("2d");
        if (!context) {
            console.error("Failed to get 2D context");
            return;
        }
        context.scale(dpr, dpr);

        projection = d3.geoOrthographic() // Initialize projection here
            .fitExtent([[0, 0], [width, height]], { type: "Sphere" })
            .scale(scale * 250);

        const path = d3.geoPath(projection, context);

        render = (country: d3.GeoPermissibleObjects, arc: d3.GeoPermissibleObjects) => {
            const color = d3.scaleQuantize()
                    .range(["rgb(255,245,240)", "rgb(252,187,161)", "rgb(252,146,114)", "rgb(251,106,74)", "rgb(203,24,29)"])
                    .domain([d3.min(dataset, d => d.flights), d3.max(dataset, d => d.flights)]);

            context.clearRect(0, 0, width, height);
            context.fillStyle = "rgba(255, 255, 255, 0.75)";
            context.fillRect(0, 0, width, height);

            context.beginPath();
            path({ type: "Sphere" });
            context.fillStyle = "#2F4B7C";
            context.fill();

            context.beginPath();
            path(land);
            context.fillStyle = "#A0A0A0";
            context.fill();

            if (country) {
                context.beginPath();
                path(country);
                context.fillStyle = "#ff4444";
                context.fill();
            }

            context.beginPath();
            path(borders);
            context.strokeStyle = "#fff";
            context.lineWidth = 0.5;
            context.stroke();

            context.beginPath();
            path({ type: "Sphere" });
            context.strokeStyle = "#000";
            context.lineWidth = 1.5;
            context.stroke();

            if (arc) {
                context.beginPath();
                path(arc);
                context.strokeStyle = "#fff";
                context.lineWidth = 1;
                context.stroke();
            }

            return context.canvas;
        };

        let currentCountry = null;
        let isDragging = false;
        let previousMousePosition: any[] | null = null;

        const handleZoom = debounce((event: { preventDefault: () => void; deltaY: any; }) => {
            event.preventDefault();
            const delta = event.deltaY;
            const zoomFactor = 0.1;
            let newScale = scale;

            if (delta > 0) {
                newScale = Math.max(MIN_SCALE, scale - zoomFactor);
            } else {
                newScale = Math.min(MAX_SCALE, scale + zoomFactor);
            }

            smoothZoom(newScale);
        }, 16);

        const rotateGlobe = async (direction: string) => {
            const rotation = projection.rotate();
            const targetRotation = [...rotation];
            if (direction === "left") {
                targetRotation[0] -= 90;
            } else if (direction === "right") {
                targetRotation[0] += 90;
            }

            const interpolator = d3.interpolate(rotation, targetRotation);
            let start: number | null = null;
            const duration = 750;

            const animate = (timestamp: number) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                if (progress < 1) {
                    projection.rotate(interpolator(progress));
                    render(currentCountry);
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    projection.rotate(targetRotation);
                    render(currentCountry);
                }
            };

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        const onDragStart = (event: { clientX: any; clientY: any; }) => {
            isDragging = true;
            previousMousePosition = [event.clientX, event.clientY];
        };

        const onDragMove = (event: { clientX: number; clientY: number; }) => {
            if (!isDragging || !previousMousePosition) return;

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            const [prevX, prevY] = previousMousePosition;
            const deltaX = event.clientX - prevX;
            const deltaY = event.clientY - prevY;
            const rotation = projection.rotate();
            rotation[0] += deltaX * 0.2;
            rotation[1] -= deltaY * 0.2;

            animationFrameId = requestAnimationFrame(() => {
                projection.rotate(rotation);
                render(currentCountry);
            });

            previousMousePosition = [event.clientX, event.clientY];
        };

        const container = d3.select(".earth");
        container.html("");
        const canvasNode = canvas.node();
        container.node()?.appendChild(canvasNode);

        canvasNode.addEventListener("mousedown", onDragStart);
        canvasNode.addEventListener("mousemove", onDragMove);
        canvasNode.addEventListener("mouseup", () => (isDragging = false));
        canvasNode.addEventListener("mouseleave", () => (isDragging = false));
        canvasNode.addEventListener("wheel", handleZoom);

        render(null);

        d3.select("#rotate-left").on("click", () => rotateGlobe("left"));
        d3.select("#rotate-right").on("click", () => rotateGlobe("right"));
        d3.select("#zoom-in").on("click", () => smoothZoom(Math.min(MAX_SCALE, scale + 0.5)));
        d3.select("#zoom-out").on("click", () => smoothZoom(Math.max(MIN_SCALE, scale - 0.5)));
    };

    const drawEarth = () => {
        d3.csv(`/dataset/csv${selectedYear}.csv`, rowConverter)
            .then((data) => {
                createEarth(data);
            })
            .catch((error) => {
                console.error("Error loading CSV:", error);
            });
    };

    useEffect(() => {
        drawEarth();
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            d3.select(".earth canvas").remove();
        };
    }, [selectedYear]);

    return (
        <div className="flex items-center justify-center h-screen flex-col mb-4 mt-20">
            <h1 className="text-4xl mb-4 mt-10">Earth</h1>

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

            <div className="earth mb-5"></div>

            <div className="flex space-x-4 mb-20">
                <Button id="rotate-left" 
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Rotate Left</Button>
                <Button id="rotate-right"  
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Rotate Right</Button>
                <Button id="zoom-in"
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Zoom In</Button>
                <Button id="zoom-out"
                    className="px-8 py-2 text-md font-medium
                    text-white bg-black rounded-md
                    hover:bg-zinc-500 hover:scale-110
                    active:bg-zinc-300 active:translate-y-1
                    transform transition duration-200"
                >Zoom Out</Button>
            </div>
        </div>
    );
}
