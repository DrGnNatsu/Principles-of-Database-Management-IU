// The data types used in the application
export interface HeatMapData {
  entity: string;
  week: number;
  day: string;
  flights: number;
  day_2019: string;
  flights_2019_reference: number;
  percent_vs_2019_daily: number;
  day_previous_year: string;
  flights_previous_year: number;
}
export interface HeatMapProps {
  width?: string; // Width in rem
  height?: string; // Height in rem
  margin_top?: number;
  margin_right?: number; 
  margin_bottom?: number; 
  margin_left?: number; 
}

// Data types of the API response onflight
export interface FlightSchedule {
  scheduleID: string;
  flightStatus: FlightStatus;
  departureDate: string;
  arrivalDate: string;
  departure: string;
  arrival: string;
  flightDuration: number;
}

// Define the Status interface
export interface FlightStatus {
  statusID: string;
  status: string;
}

export interface Passenger {
  passengerID: string;
  firstName: string;
  lastName: string;
  passport: string;
  age: number;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  address: string;
  naltionality: string;
}

export interface SeatClass {
  classType: string;
  basePrice: number;
}

export interface Seat {
  seatNumber: string;
  classClass: SeatClass;
}

export interface Booking {
  bookingID: string;
  bookingDate: string;
  paymentStatus: string;
}

export interface Airline {
  airlineID: string;
  airlineName: string;
}

export interface Airport {
  airportID: string;
  airportName: string;
  city: string;
  country: string;
}

export interface Employee {
  employeeID: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  role: string;
  salary: number;
}

export interface AirportStaff {
  airportStaffID: string;
  employee: Employee;
  airport: Airport;
  status: string;
  role: string;
}


export interface FlightBase {
  flightID: string;
  airport: Airport;
  airline: Airline;
  flightSchedule: FlightSchedule;
  gateNumber: number;
}

export interface Ticket {
  ticketID: string;
  booking: Booking;
  passenger: Passenger;
  seat: Seat;
  flightBase: FlightBase;
  finalPrice: number;
  baggageWeight: number;
}

export interface FlightCrew {
  flightCrewID: string;
  employee: Employee;
  flightBase: FlightBase;
  role: string;
  status: string;
}
