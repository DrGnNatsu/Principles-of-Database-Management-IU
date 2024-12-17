package org.example.backend.entity;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

@Getter
@Setter
@Table(name = "airport_staff")
@Entity
public class AirportStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "airport_staff_id", nullable = false, length=5)
    private String airportStaffID;

    @ManyToOne
    @JoinColumn(name = "airportid", nullable = false)
    private Airport airport;

    @ManyToOne
    @JoinColumn(name = "employeeid", nullable = false)
    private Employee employee;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "status", nullable = false)
    private String status;

}
