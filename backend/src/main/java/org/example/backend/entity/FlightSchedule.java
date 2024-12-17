package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Setter
@Table(name = "flight_schedule")
@Entity
public class FlightSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scheduleid", nullable = false, length=5)
    private String scheduleID;

    @ManyToOne
    @JoinColumn(name = "statusid", nullable = false)
    private FlightStatus flightStatus;

    @Column(name = "departure_date", nullable = false)
    private LocalDateTime departureDate;

    @Column(name = "arrival_date", nullable = false)
    private LocalDateTime arrivalDate;

    @Column(name = "departure", nullable = false)
    private String departure;

    @Column(name = "arrival", nullable = false)
    private String arrival;

    @Transient
    @Column(name = "flight_duration", nullable = false)
    private Float flightDuration;

    public FlightSchedule(String scheduleID) {
        this.scheduleID = scheduleID;
    }

    public FlightSchedule() {

    }

    @PostLoad
    @PostPersist
    @PostUpdate
    private void calculateFlightDuration() {
        if (departureDate != null && arrivalDate != null) {
            this.flightDuration = (float) Duration.between(departureDate, arrivalDate).toHours();
        }
    }

}
