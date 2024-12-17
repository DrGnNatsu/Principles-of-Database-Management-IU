"use client";

import HeatMap from "./heat_map";
import FlightInYear from "./flight_in_year";
import BarChart from "./bar_chart";

export default function Data() {
  return (
    <div className="flex flex-col items-center p-20 mt-8"> {/*<!-- Add padding: p-20 and margin top: mt-8 -->*/}  
      
      <h1 className="text-3xl font-bold mb-8">European Aviation Traffic</h1>

      <div className="w-full max-w-6xl bg-neutral-50 rounded-lg shadow-lg p-6 flex justify-center items-center mt-8">
        <FlightInYear/>
      </div>

      <div className="w-full max-w-6xl bg-neutral-50 rounded-lg shadow-lg p-6 flex justify-center items-center mt-8">
        <BarChart/>
      </div>

      <div className="w-full max-w-6xl bg-neutral-50 rounded-lg shadow-lg p-6 flex justify-center items-center mt-8">
        <HeatMap/>
      </div>
    </div>
  );
}
