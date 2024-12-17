package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class FlightScheduleDTO {

    private String scheduleID;
    private FlightStatusDTO flightStatus;
    private LocalDateTime departureDate;
    private LocalDateTime arrivalDate;
    private String departure;
    private String arrival;
    private Float flightDuration;

    public FlightScheduleDTO(FlightStatusDTO flightStatus, LocalDateTime departureDate, LocalDateTime arrivalDate, String departure, String arrival, Float flightDuration) {
        this.flightStatus = flightStatus;
        this.departureDate = departureDate;
        this.arrivalDate = arrivalDate;
        this.departure = departure;
        this.arrival = arrival;
        this.flightDuration = flightDuration;
    }

}
