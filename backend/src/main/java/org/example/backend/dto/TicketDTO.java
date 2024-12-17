package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketDTO {

    private PassengerDTO passenger;
    private BookingDTO booking;
    private SeatDTO seat;
    private FlightBaseDTO flight;
    private double finalPrice;
    private double baggageWeight;

    public TicketDTO(PassengerDTO passenger, BookingDTO booking, SeatDTO seat, FlightBaseDTO flight, double finalPrice, double baggageWeight) {
        this.passenger = passenger;
        this.booking = booking;
        this.seat = seat;
        this.flight = flight;
        this.finalPrice = finalPrice;
        this.baggageWeight = baggageWeight;
    }

}
