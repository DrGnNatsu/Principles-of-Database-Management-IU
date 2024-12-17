package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "employee")
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employeeid", nullable = false, length=5)
    private String employeeID;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "gender", nullable = false)
    private char gender;

    @Column(name = "date_of_birth", nullable = false)
    private String dateOfBirth;
    // Check if dateOfBirth is in the past
    // Check if dateOfBirth is in the format dd-mm-yyyy

    @Column(name = "age", nullable = false)
    private int age; // Check if age >= 18 and <= 100

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "salary", nullable = false)
    private double salary; // Check if salary >= 0

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber; // Check if phoneNumber is in the format 0xxxxxxxxx

}
