package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlightBaseDTO {
    private String flightID;
    private int gateNumber;
    private AirlineDTO airline;
    private FlightScheduleDTO flightSchedule;
    private AirportDTO departureAirport;

    public FlightBaseDTO(String flightID, int gateNumber, AirlineDTO airline,
                         FlightScheduleDTO flightSchedule, AirportDTO departureAirport) {
        this.flightID = flightID;
        this.gateNumber = gateNumber;
        this.airline = airline;
        this.flightSchedule = flightSchedule;
        this.departureAirport = departureAirport;
    }

}
