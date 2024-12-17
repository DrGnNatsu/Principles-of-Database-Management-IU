package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "airline")
@Entity
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "airlineid", nullable = false, length=5)
    private String airlineID;

    @Column(name = "airline_name", nullable = false)
    private String airlineName;

    public Airline(String airlineName) {
        this.airlineName = airlineName;
    }

    public Airline() {}

}
