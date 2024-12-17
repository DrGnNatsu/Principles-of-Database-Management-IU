"use client";

import { FlightSchedule, FlightBase } from '../types/types';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

// Move constant outside component
const SEAT_CLASS_PRICES = {
    'Economy': 1000000,
    'Business': 2000000,
    'First Class': 3000000
} as const;

// Update email validation regex
const isValidEmail = (email: string): boolean => {
    // Simplified but robust email regex
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

export default function Flight() {
    const table_header = [
        "Departure Date", 
        "Arrival Date", 
        "Departure", 
        "Arrival", 
        "Duration", 
        "Status", 
        "Airline",  
        "Booking"   
    ];

    const [flightBase, setFlightBase] = useState<FlightBase[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [departureDate, setDepartureDate] = useState<string>('');
    const [arrivalDate, setArrivalDate] = useState<string>('');
    const [departure, setDeparture] = useState<string>('');
    const [arrival, setArrival] = useState<string>('');

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedFlightBase, setSelectedFlightBase] = useState<FlightBase | null>(null);
    const [bookingForm, setBookingForm] = useState({
        firstName: '',
        lastName: '',
        age: '',  
        email: '',
        phone: '',
        passport: '',
        dateOfBirth: '',
        nationality: '',
        address: '',
        baggageWeight: 0,
    });

    const [seatClass, setSeatClass] = useState<keyof typeof SEAT_CLASS_PRICES>('Economy');
    const [finalPrice, setFinalPrice] = useState<number>(SEAT_CLASS_PRICES.Economy);

    // Add loading state
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const newPrice = calculateRandomPrice();
        setFinalPrice(newPrice);
    }, [seatClass]);

    const calculateRandomPrice = () => {
        const baseFare = SEAT_CLASS_PRICES[seatClass];
        const multiplier = 1 + Math.random() * 0.3; // 0-30% variation
        return Math.round(baseFare * multiplier);
    };

    const handleClick = () => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams({
                    ...(departure && { departure }),
                    ...(arrival && { arrival }),
                    ...(departureDate && { departureDate }),
                    ...(arrivalDate && { arrivalDate })
                });

                const res = await fetch(`http://localhost:8080/api/flight-base/search?${params}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                });

                if (!res.ok) {
                    throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
                }

                const data: FlightBase[] = await res.json();
                setFlightBase(data);
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message);
            }
        };
        
        fetchData();
    }

    const handleBook = (flightBase: FlightBase) => {
        setSelectedFlightBase(flightBase);
        setFinalPrice(calculateRandomPrice());
        setIsBookingModalOpen(true);
    };

    // Update form validation
    const validateForm = () => {
        if (!bookingForm.email) {
            alert('Email is required');
            return false;
        }
        
        if (!isValidEmail(bookingForm.email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        return true;
    };

        // Update handleBookingSubmit function
    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !selectedFlightBase) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const bookingData = {
                passenger: {
                    firstName: bookingForm.firstName,
                    lastName: bookingForm.lastName,
                    age: parseInt(bookingForm.age),  
                    email: bookingForm.email,
                    phoneNumber: bookingForm.phone,
                    passportNumber: bookingForm.passport,
                    dateOfBirth: bookingForm.dateOfBirth,
                    nationality: bookingForm.nationality,
                    address: bookingForm.address
                },
                flight: {
                    flightID: selectedFlightBase.flightID  // Update this line
                },
                seat: {
                    seatClass: {
                        classType: seatClass
                    }
                },
                booking: {
                    bookingDate: new Date()
                },
                baggageWeight: bookingForm.baggageWeight,
                finalPrice: finalPrice
            };
    
            const response = await fetch('http://localhost:8080/api/tickets/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
    
            if (!response.ok) {
                throw new Error(`Booking failed: ${response.statusText}`);
            }
    
            alert('Booking successful!');
            setIsBookingModalOpen(false);
            resetForm();
            
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.message || 'Failed to create booking');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setBookingForm({
            firstName: '',
            lastName: '',
            age: '',
            email: '',
            phone: '',
            passport: '',
            dateOfBirth: '',
            nationality: '',
            address: '',
            baggageWeight: 0,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case 'on time':
            return 'text-green-500';
          case 'cancelled':
            return 'text-red-600';
          case 'delayed':
            return 'text-amber-400';
          default:
            return 'text-black';
        }
    };

    const handleSeatClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSeatClass = e.target.value as keyof typeof SEAT_CLASS_PRICES;
        setSeatClass(newSeatClass);
    };

    return (
        <div className="flex justify-center h-screen">
            <div className="w-full max-w-6xl p-6 bg-opacity-80" style={{ marginTop: '100px' }}>
                <div className="mb-6">
                    <div className="flex space-x-4 mb-4">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="from-departure" className="text-white text-2xl font-bold italic mb-2">
                                From:
                            </label>
                            <input
                                id="from-departure"
                                type="text"
                                onChange={(e) => setDeparture(e.target.value)}
                                value={departure}
                                className="w-full px-4 py-2 text-black rounded-lg focus:outline-none bg-white/50 border-2 border-black focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                                placeholder="Cam Ranh (CXR)"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="to-arrival" className="text-white text-2xl font-bold italic mb-2">
                                To:
                            </label>
                            <input
                                id="to-arrival"
                                type="text"
                                onChange={(e) => setArrival(e.target.value)}
                                value={arrival}
                                className="w-full px-4 py-2 text-black rounded-lg focus:outline-none bg-white/50 border-2 border-black focus:ring-2 focus:ring-blue-500 placeholder:text-black"
                                placeholder="Dubai (DXB)"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="date-departure" className="text-white text-2xl font-bold italic mb-2">
                                Date of Departure:
                            </label>
                            <input
                                id="date-departure"
                                type="date"
                                onChange={(e) => setDepartureDate(e.target.value)}
                                value={departureDate}
                                className="w-full px-4 py-2 text-black rounded-lg focus:outline-none bg-white/50 border-2 border-black focus:ring-2 focus:ring-blue-500"
                                placeholder="10/10/2024"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="date-arrival" className="text-white text-2xl font-bold italic mb-2">
                                Date of Arrival:
                            </label>
                            <input
                                id="date-arrival"
                                type="date"
                                onChange={(e) => setArrivalDate(e.target.value)}
                                value={arrivalDate}
                                className="w-full px-4 py-2 text-black rounded-lg focus:outline-none bg-white/50 border-2 border-black focus:ring-2 focus:ring-blue-500"
                                placeholder="10/10/2024"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleClick}
                            className="w-32 bg-black text-white font-bold text-xl py-3 px-8 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200">            
                            View
                        </Button>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {table_header.map((header, index) => (
                            <TableHead
                                key={index}
                                className="px-6 py-3 text-center text-lg font-bold italic text-black uppercase tracking-wider bg-white/50"
                            >
                                {header}
                            </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flightBase.map((item, index) => (
                            <TableRow key={index} className="bg-white/50 text-center text-base text-black uppercase tracking-wider hover:bg-white/70 transition-colors duration-200">
                                <TableCell className="px-6 py-4 text-center">{formatDate(item.flightSchedule.departureDate)}</TableCell>
                                <TableCell className="px-6 py-4 text-center">{formatDate(item.flightSchedule.arrivalDate)}</TableCell>
                                <TableCell className="px-6 py-4 text-center">{item.flightSchedule.departure}</TableCell>
                                <TableCell className="px-6 py-4 text-center">{item.flightSchedule.arrival}</TableCell>
                                <TableCell className="px-6 py-4 text-center">{item.flightSchedule.flightDuration} hrs</TableCell>
                                <TableCell className={`p-2 min-h-[64px] min-w-[120px] relative`}>
                                    <div 
                                        className={`
                                            flex items-center justify-center
                                            text-center text-xl font-extrabold 
                                            ${getStatusColor(item.flightSchedule.flightStatus.status)}
                                            ${item.flightSchedule.flightStatus.status.toLowerCase() === 'on time' 
                                            ? 'bg-green-100' 
                                            : item.flightSchedule.flightStatus.status.toLowerCase() === 'cancelled' 
                                            ? 'bg-red-100' 
                                            : 'bg-amber-100'
                                            }
                                            rounded-lg
                                            shadow-sm
                                            whitespace-nowrap
                                            px-6 py-3
                                            h-full w-[calc(100%-8px)]
                                        `}
                                    >
                                    {item.flightSchedule.flightStatus.status.toLowerCase() === 'cancelled' 
                                    ? 'Cancel' : item.flightSchedule.flightStatus.status.toUpperCase()}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    {item.airline.airlineName}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    {item.flightSchedule.flightStatus.status.toLowerCase() !== 'cancelled' && (
                                        <Button 
                                            onClick={() => handleBook(item)}
                                            className="bg-black text-white font-bold text-lg py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200">
                                            Book
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Booking Details</h2>
                            <button 
                                onClick={() => setIsBookingModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.firstName}
                                        placeholder="Enter your first name"
                                        onChange={(e) => setBookingForm({...bookingForm, firstName: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium ttext-white">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.lastName}
                                        placeholder="Enter your last name"
                                        onChange={(e) => setBookingForm({...bookingForm, lastName: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Age</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="120"
                                    value={bookingForm.age}
                                    placeholder="Enter your age"
                                    onChange={(e) => setBookingForm({...bookingForm, age: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={bookingForm.email}
                                    placeholder="Enter your email"
                                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={bookingForm.phone}
                                    placeholder="Enter 10-digit phone number"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Passport Number</label>
                                <input
                                    type="text"
                                    required
                                    value={bookingForm.passport}
                                    placeholder="Enter your passport number"
                                    onChange={(e) => setBookingForm({...bookingForm, passport: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingForm.dateOfBirth}
                                    onChange={(e) => setBookingForm({...bookingForm, dateOfBirth: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Nationality</label>
                                <input
                                    type="text"
                                    required
                                    value={bookingForm.nationality}
                                    placeholder='Enter your Nationality'
                                    onChange={(e) => setBookingForm({...bookingForm, nationality: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Baggage Weight</label>
                                <input
                                    type="number"
                                    required
                                    value={bookingForm.baggageWeight}
                                    placeholder='Enter your baggage weight'
                                    onChange={(e) => setBookingForm({...bookingForm, baggageWeight: parseInt(e.target.value)})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Address</label>
                                <textarea
                                    required
                                    value={bookingForm.address}
                                    placeholder='Enter your address'
                                    onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 placeholder-gray-400 pl-2"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white">Seat Class</label>
                                <select
                                    required
                                    value={seatClass}
                                    onChange={handleSeatClassChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-zinc-700 bg-white pl-2"
                                >
                                    <option value="Economy">Economy Class</option>
                                    <option value="Business">Business Class</option>
                                    <option value="First Class">First Class</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Base prices: Economy ₫1M, Business ₫2M, First Class ₫3M
                                </p>
                            </div>

                            <div className="mt-6 p-4 bg-zinc-900 rounded-lg">
                                <label className="block text-sm font-medium text-white mb-2">Final Price</label>
                                <div className="text-3xl font-bold text-green-500 text-center">
                                    ${finalPrice.toLocaleString()}
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-1">
                                    *Price includes all taxes and fees
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-white bg-zinc-900 rounded-md hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Confirm Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
