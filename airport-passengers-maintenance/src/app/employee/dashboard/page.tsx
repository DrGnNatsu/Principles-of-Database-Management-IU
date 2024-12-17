'use client';

import { useState } from 'react';
import { 
  Plane, 
  Users, 
  Calendar,
  Clock,
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const [statistics] = useState({
    totalFlights: 156,
    activeFlights: 24,
    totalPassengers: 1893,
    delayedFlights: 3
  });

  return (
    <div className="flex h-screen bg-black">
      <div className="flex-1 p-7">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Flights</p>
              <p className="text-2xl font-bold">{statistics.totalFlights}</p>
            </div>
            <Plane className="h-10 w-10 text-blue-500" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Flights</p>
              <p className="text-2xl font-bold">{statistics.activeFlights}</p>
            </div>
            <Clock className="h-10 w-10 text-green-500" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Passengers</p>
              <p className="text-2xl font-bold">{statistics.totalPassengers}</p>
            </div>
            <Users className="h-10 w-10 text-purple-500" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delayed Flights</p>
              <p className="text-2xl font-bold">{statistics.delayedFlights}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        {/* Recent Flights Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Flights</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Flight ID</th>
                <th className="pb-3">Route</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">FL001</td>
                <td className="py-3">Singapore → Bangkok</td>
                <td className="py-3">10:30 AM</td>
                <td className="py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">On Time</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-3">FL002</td>
                <td className="py-3">Bangkok → Tokyo</td>
                <td className="py-3">11:45 AM</td>
                <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Delayed</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-500 text-white rounded-xl shadow-md p-6 hover:bg-blue-600 transition-colors">
            <Plane className="h-8 w-8 mb-2" />
            <p className="font-semibold">Add New Flight</p>
          </button>
          <button className="bg-purple-500 text-white rounded-xl shadow-md p-6 hover:bg-purple-600 transition-colors">
            <Users className="h-8 w-8 mb-2" />
            <p className="font-semibold">Manage Passengers</p>
          </button>
          <button className="bg-green-500 text-white rounded-xl shadow-md p-6 hover:bg-green-600 transition-colors">
            <Calendar className="h-8 w-8 mb-2" />
            <p className="font-semibold">View Schedule</p>
          </button>
        </div>
      </div>
    </div>
  );
}