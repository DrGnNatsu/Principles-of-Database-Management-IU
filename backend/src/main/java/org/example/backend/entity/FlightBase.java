package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "flight_base")
@Entity
public class FlightBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flightid", nullable = false, length=5)
    private String flightID;

    @ManyToOne
    @JoinColumn(name = "airlineid", nullable = false)
    private Airline airline;

    @ManyToOne
    @JoinColumn(name = "scheduleid", nullable = false)
    private FlightSchedule flightSchedule;

    @ManyToOne
    @JoinColumn(name = "airportid", nullable = false)
    private Airport airport;

    @Column(name = "gate_number", nullable = false)
    private int gateNumber;

}
