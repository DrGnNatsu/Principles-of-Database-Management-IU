package org.example.backend.entity;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

@Getter
@Setter
@Table(name = "gate")
@Entity
public class Gate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gate_number", nullable = false)
    private Long gateNumber;

    @ManyToOne
    @JoinColumn(name = "airportid", nullable = false)
    private Airport airportID;

    @Column(name = "status", nullable = false)
    private String status;

}

//CREATE TABLE Gate (
//                      Gate_number INT PRIMARY KEY,
//                      AirportID INT,
//                      Status NVARCHAR(50),
//                      CONSTRAINT fk_airport_gate FOREIGN KEY (AirportID) REFERENCES Airport(AirportID) ON DELETE CASCADE
//);