package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "flight_crew")
@Entity
public class FlightCrew {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_crew_id", nullable = false, length=5)
    private String flightCrewID;

    @ManyToOne
    @JoinColumn(name = "employeeid", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "flightid", nullable = false)
    private FlightBase flightBase;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "status", nullable = false)
    private String status;
}
