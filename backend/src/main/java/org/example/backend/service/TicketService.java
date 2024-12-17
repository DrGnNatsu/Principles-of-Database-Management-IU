package org.example.backend.service;

import org.example.backend.dto.*;
import org.example.backend.entity.*;

import org.example.backend.repository.*;
import org.example.backend.util.IDGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TicketService {

    @Autowired
    private final TicketRepository ticketRepository;

    @Autowired
    private final PassengerRepository passengerRepository;

    @Autowired
    private final BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private FlightBaseRepository flightBaseRepository;

    @Autowired
    private IDGenerator idGenerator = new IDGenerator();

    // Add constants for ID prefixes and digits
    private static final String PASSENGER_PREFIX = "PA";
    private static final String BOOKING_PREFIX = "BK";
    private static final String TICKET_PREFIX = "TK";
    private static final int ID_DIGITS = 3;

    public TicketService(TicketRepository ticketRepository,
                         PassengerRepository passengerRepository,
                         SeatRepository seatRepository,
                         BookingRepository bookingRepository,
                         FlightBaseRepository flightBaseRepository) {
        this.ticketRepository = ticketRepository;
        this.flightBaseRepository = flightBaseRepository;
        this.passengerRepository = passengerRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public Ticket saveTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByEmail(String email) {
        return ticketRepository.findAllByPassengerID_Email(email);
    }

    @Transactional
    public void deleteTicketAndPassenger(String ticketID) {
        Ticket ticket = ticketRepository.findByTicketID(ticketID);
        if (ticket != null) {
            // Get IDs before deletion
            String passengerID = ticket.getPassenger().getPassengerID();
            String bookingID = ticket.getBooking().getBookingID();

            // Delete ticket first
            ticketRepository.deleteByTicketID(ticketID);

            // Delete passenger if no other tickets exist
            if (ticketRepository.countByPassengerID(passengerID) == 0) {
                passengerRepository.deleteByPassengerID(passengerID);
            }

            // Delete booking
            bookingRepository.deleteByBookingID(bookingID);
        }
    }

    //============================================================================
    // Prepare for creating a new ticket
    //============================================================================
    private Passenger convertToEntity(PassengerDTO passengerDTO) {
        Passenger passenger = new Passenger();
        // Generate and set passengerID
        passenger.setPassengerID(generatePassengerID());
        passenger.setFirstName(passengerDTO.getFirstName());
        passenger.setLastName(passengerDTO.getLastName());
        passenger.setAge(passengerDTO.getAge());
        passenger.setEmail(passengerDTO.getEmail());
        passenger.setPhoneNumber(passengerDTO.getPhoneNumber());
        passenger.setPassportNumber(passengerDTO.getPassportNumber());
        passenger.setDateOfBirth(passengerDTO.getDateOfBirth());
        passenger.setNationality(passengerDTO.getNationality());
        passenger.setAddress(passengerDTO.getAddress());
        return passenger;
    }

    private Booking convertToEntity(BookingDTO bookingDTO) {
        Booking booking = new Booking();

        // Handle null BookingDTO
        if (bookingDTO == null) {
            booking.setBookingDate(Date.valueOf(LocalDateTime.now().toLocalDate()));
            return booking;
        }

        // Safe conversion with null checks
        booking.setBookingDate(bookingDTO.getBookingDate() != null ?
            bookingDTO.getBookingDate() :
            Date.valueOf(LocalDateTime.now().toLocalDate()));

        return booking;
    }

    private SeatClass convertToEntity(SeatClassDTO seatClassDTO) {
        SeatClass seatClass = new SeatClass();
        seatClass.setClassType(seatClassDTO.getClassType());
        return seatClass;
    }

    // ===========================================================================
    // Generate ID
    private String generatePassengerID() {
        String lastId = passengerRepository.findFirstByOrderByPassengerIDDesc()
                .map(Passenger::getPassengerID)
                .orElse("PA000"); // Start from PA001 if no passengers exist
        return idGenerator.generateID(lastId, PASSENGER_PREFIX, ID_DIGITS);
    }

    private String generateBookingID() {
        String lastId = bookingRepository.findFirstByOrderByBookingIDDesc()
                .map(Booking::getBookingID)
                .orElse("BK000"); // Start from PA001 if no passengers exist
        return idGenerator.generateID(lastId, BOOKING_PREFIX, ID_DIGITS);
    }

    private String generateTicketID() {
        String lastId = ticketRepository.findFirstByOrderByTicketIDDesc()
                .map(Ticket::getTicketID)
                .orElse("TK000"); // Start from TK001 if no tickets exist
        return idGenerator.generateID(lastId, TICKET_PREFIX, ID_DIGITS);
    }

    // ===========================================================================
    // Create Ticket
    @Transactional
    public Ticket createTicket(TicketDTO ticketDTO) {
        // Convert and save passenger with generated ID
        Passenger passenger = ticketDTO.getPassenger() != null ?
                convertToEntity(ticketDTO.getPassenger()) :
                new Passenger();
        String passengerId = generatePassengerID();
        passenger.setPassengerID(passengerId);
        passenger = passengerRepository.save(passenger);

        // Create and save booking with generated ID
        Booking booking = convertToEntity(ticketDTO.getBooking());
        String bookingId = generateBookingID();
        booking.setBookingID(bookingId);
        booking.setBookingDate(Date.valueOf(LocalDateTime.now().toLocalDate()));
        booking = bookingRepository.save(booking);

        // Fetch FlightBase by flightID
        FlightBase flightBase = flightBaseRepository.findByFlightID(ticketDTO.getFlight().getFlightID());

        // Convert and save seat
        String seatNumber = seatRepository.findFirstByFlightIDAndClassTypeAndTicketIsNull(
                ticketDTO.getFlight().getFlightID(),
                ticketDTO.getSeat().getSeatClass().getClassType()
        );
        Seat seat = new Seat();
        seat.setSeatNumber(seatNumber);
        seat.setSeatClass(convertToEntity(ticketDTO.getSeat().getSeatClass()));

        // Create and save the ticket with generated ID
        String ticketId = generateTicketID();

        // Create and save ticket with all references
        Ticket ticket = new Ticket();
        ticket.setTicketID(ticketId);
        ticket.setPassenger(passenger);
        ticket.setBooking(booking);
        ticket.setSeat(seat);
        ticket.setFlightBase(flightBase);
        ticket.setFinalPrice(ticketDTO.getFinalPrice());
        ticket.setBaggageWeight(ticketDTO.getBaggageWeight());

        ticket = ticketRepository.save(ticket);

        return ticket;
    }

}

