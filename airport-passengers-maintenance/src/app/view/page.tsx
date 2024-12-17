'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Ticket } from "../types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Define interface for the selected ticket
interface SelectedTicket extends Ticket {}

const table_header = ["Departure Date", "Arrival Date", "Departure", "Arrival", "Duration", "Status", "Actions"];

export default function View() {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null);

  // Add state for cancel dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Add new state for no tickets dialog
  const [showNoTicketsDialog, setShowNoTicketsDialog] = useState(false);

  // Add state for empty email dialog
  const [showEmptyEmailDialog, setShowEmptyEmailDialog] = useState(false);

  // Modify handleFetchTickets to show dialog
  const handleFetchTickets = async () => {
    if (!email) {
      setShowEmptyEmailDialog(true);
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/tickets/email/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        setShowNoTicketsDialog(true);
        return;
      }
      
      const data: Ticket[] = await response.json();
      if (data.length === 0) {
        setShowNoTicketsDialog(true);
      } else {
        setTickets(data);
      }
    } catch (err) {
      setShowNoTicketsDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
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

  // Update handleCancel function
  const handleCancel = (ticketID: string) => {
    setTicketToCancel(ticketID);
    setIsCancelDialogOpen(true);
  };

  // Add confirmation handler
  const confirmCancel = async () => {
    if (!ticketToCancel) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch(`http://localhost:8080/api/tickets/${ticketToCancel}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setTickets(tickets.filter(ticket => ticket.ticketID !== ticketToCancel));
        setIsCancelDialogOpen(false);
      } else {
        throw new Error('Failed to cancel ticket');
      }
    } catch (err) {
      console.error('Error cancelling ticket:', err);
    } finally {
      setIsCancelling(false);
      setTicketToCancel(null);
    }
  };

  const handleDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Add CancelDialog component
  const CancelDialog = () => (
    <Dialog open={isCancelDialogOpen} onOpenChange={() => setIsCancelDialogOpen(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">Cancel Ticket</DialogTitle>
          <DialogDescription className="text-zinc-600 text-xl">
            Are you sure you want to cancel this ticket? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4 mt-6 ">
          <Button
            variant="outline"
            onClick={() => setIsCancelDialogOpen(false)}
            className="px-4 py-2 hover:bg-slate-800 hover:text-white text-black font-bold"
          >
            Keep Ticket
          </Button>
          <Button
            variant="destructive"
            onClick={confirmCancel}
            disabled={isCancelling}
            className={`
              px-6 py-3
              bg-gradient-to-r from-red-500 to-red-700
              hover:from-red-600 hover:to-red-800
              text-white font-bold text-lg
              rounded-lg
              shadow-lg hover:shadow-xl
              transform hover:scale-105
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isCancelling ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cancelling...
              </>
            ) : (
              'Cancel Ticket'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Add NoTicketsDialog component
  const NoTicketsDialog = () => (
    <Dialog open={showNoTicketsDialog} onOpenChange={() => setShowNoTicketsDialog(false)}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            No Tickets Found
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className="p-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10h.01M15 10h.01"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.5 15.5c.574.919 1.912 2 4.5 2s3.926-1.081 4.5-2"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-gray-800 text-xl font-semibold">
                Oops! No tickets found
              </p>
              <p className="text-gray-600 text-base">
                We couldn't find any tickets associated with <br/>
                <span className="font-medium">this email address</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setShowNoTicketsDialog(false)}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600
              hover:from-indigo-600 hover:to-purple-700
              text-white font-semibold rounded-full
              transform hover:scale-105 transition-all duration-200
              shadow-lg hover:shadow-xl
              flex items-center space-x-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span>Try Another Email</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Add EmptyEmailDialog component
  const EmptyEmailDialog = () => (
    <Dialog open={showEmptyEmailDialog} onOpenChange={() => setShowEmptyEmailDialog(false)}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-500 text-center">
            Email Required
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <div className="p-6">
              <svg
                className="mx-auto h-24 w-24 text-amber-500 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <p className="text-gray-800 text-xl font-semibold">
                Please Enter Your Email
              </p>
              <p className="text-gray-600 text-base">
                We need your email address to find your tickets
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setShowEmptyEmailDialog(false)}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600
              hover:from-amber-600 hover:to-amber-700
              text-white font-semibold rounded-lg
              transform hover:scale-105 transition-all duration-200
              shadow-lg hover:shadow-xl
              flex items-center space-x-2"
          >
            <span>Got It</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex justify-center h-screen">
      <div className="w-full max-w-6xl p-3 bg-opacity-80" style={{ marginTop: '100px' }}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-white text-2xl font-bold italic mb-2">
            Enter your email:
          </label>
          <div className="flex">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-2/5 px-4 py-1 text-white rounded-l-lg rounded-r-lg focus:outline-none bg-white/30 border-2 border-black focus:ring-2 focus:ring-blue-500 mr-2.5 placeholder:text-white placeholder:italic placeholder:font-bold"
            />
            <Button 
              onClick={handleFetchTickets}
              disabled={loading}
              className="bg-black text-white font-bold py-4 px-6 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200"
            >
              {loading ? 'Loading...' : 'View'}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {tickets.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {table_header.map((header, index) => (
                  <TableHead key={index} className="px-6 py-3 text-center text-lg font-bold italic text-black uppercase tracking-wider bg-white/50">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
            {tickets.map((ticket, index) => (
                <TableRow key={index} className="bg-white/50 text-center text-base text-black uppercase tracking-wider hover:bg-white/70 transition-colors duration-200">
                  <TableCell className="px-6 py-4 text-center text-lg">
                    {formatDateTime(ticket.flightBase.flightSchedule.departureDate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-lg">
                    {formatDateTime(ticket.flightBase.flightSchedule.arrivalDate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-lg">
                    {ticket.flightBase.flightSchedule.departure}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-lg">
                    {ticket.flightBase.flightSchedule.arrival}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-lg">
                    {ticket.flightBase.flightSchedule.flightDuration} hours
                  </TableCell>
                  <TableCell 
                    className={`
                      p-2
                      min-h-[64px]
                      min-w-[120px]
                      relative
                    `}
                  >
                    <div 
                      className={`
                        flex items-center justify-center
                        text-center text-xl font-extrabold 
                        ${getStatusColor(ticket.flightBase.flightSchedule.flightStatus.status)}
                        ${ticket.flightBase.flightSchedule.flightStatus.status.toLowerCase() === 'on time' 
                          ? 'bg-green-100' 
                          : ticket.flightBase.flightSchedule.flightStatus.status.toLowerCase() === 'cancelled' 
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
                      {ticket.flightBase.flightSchedule.flightStatus.status.toLowerCase() === 'cancelled' 
                      ? 'Cancel' : ticket.flightBase.flightSchedule.flightStatus.status.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-center">
                      <Button
                        className="bg-black text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-800 focus:outline-none transform hover:scale-105 transition-transform duration-200"
                        onClick={() => handleCancel(ticket.ticketID)} // Add your cancel handler
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-black text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200"
                        onClick={() => handleDetail(ticket)} // Add your detail handler
                      >
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
            <button
              className="absolute top-4 right-4 bg-black text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none transform hover:scale-105 transition-transform duration-200"
              onClick={closeModal}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-black border-b pb-3 text-center">Ticket Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
              <div className="bg-white/90 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
                <h3 className="font-semibold text-lg mb-3 text-black">Passenger Information</h3>
                <div className="space-y-2">
                  <p className='text-black'><span className="font-medium">Ticket ID:</span> {selectedTicket.ticketID}</p>
                  <p className='text-black'><span className="font-medium">Passenger:</span> {selectedTicket.passenger.firstName} {selectedTicket.passenger.lastName}</p>
                  <p className='text-black'><span className="font-medium">Seat:</span> {selectedTicket.seat.seatNumber}</p>
                  <p className='text-black'><span className="font-medium">Baggage Weight:</span> {selectedTicket.baggageWeight} kg</p>
                  <p className='text-black'><span className="font-medium">Final Price:</span> ${selectedTicket.finalPrice}</p>
                </div>
              </div>

              <div className="bg-white/90 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
                <h3 className="font-semibold text-lg mb-3 text-black">Flight Information</h3>
                <div className="space-y-2">
                  <p className='text-black'><span className="font-medium">Flight ID:</span> {selectedTicket.flightBase.flightID}</p>
                  <p className='text-black'><span className="font-medium">Airline:</span> {selectedTicket.flightBase.airline.airlineName}</p>
                  <p className='text-black'><span className="font-medium">Gate:</span> {selectedTicket.flightBase.gateNumber}</p>
                </div>
              </div>

              <div className="bg-white/90 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
                <h3 className="font-semibold text-lg mb-3 text-black">Schedule Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className='text-black'><span className="font-medium">Departure:</span> {selectedTicket.flightBase.flightSchedule.departure}</p>
                    <p className='text-black'><span className="font-medium">Departure Date:</span> {formatDate(selectedTicket.flightBase.flightSchedule.departureDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className='text-black'><span className="font-medium">Arrival:</span> {selectedTicket.flightBase.flightSchedule.arrival}</p>
                    <p className='text-black'><span className="font-medium">Arrival Date:</span> {formatDate(selectedTicket.flightBase.flightSchedule.arrivalDate)}</p>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <p className='text-black'><span className="font-medium">Duration:</span> {selectedTicket.flightBase.flightSchedule.flightDuration} Hours</p>
                    <p className='text-black'>
                      <span className="font-medium">Status:</span> 
                      <span className={`
                        ml-2 px-4 py-1.5 
                        rounded-full text-xl 
                        font-extrabold
                        ${getStatusColor(selectedTicket.flightBase.flightSchedule.flightStatus.status)}
                        ${selectedTicket.flightBase.flightSchedule.flightStatus.status.toLowerCase() === 'on time' ? 'bg-green-100' : 
                          selectedTicket.flightBase.flightSchedule.flightStatus.status.toLowerCase() === 'cancelled' ? 'bg-red-100' : 
                          'bg-amber-100'
                        }
                        transition-all duration-200
                        shadow-sm
                      `}>
                        {selectedTicket.flightBase.flightSchedule.flightStatus.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CancelDialog />
      <NoTicketsDialog />
      <EmptyEmailDialog />
    </div>
  );
}
