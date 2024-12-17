package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "ticket")
@Entity
public class Ticket {

    @Id
    @Column(name = "ticketid", nullable = false, length=5)
    private String ticketID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passengerid", nullable = false)
    private Passenger passenger;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_number", nullable = false)
    private Seat seat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bookingID", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flightID", nullable = false)
    private FlightBase flightBase;

    @Column(name = "final_price", nullable = false)
    private double finalPrice;

    @Column(name = "baggage_weight", nullable = false)
    private double baggageWeight;
}
