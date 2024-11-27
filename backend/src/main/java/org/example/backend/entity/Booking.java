package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
@Table(name = "booking")
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id", nullable = false)
    private Integer bookingId;

    @Column(name = "booking_date", nullable = false)
    private Date bookingDate; // DATETIME

    @Column(name = "Payment_status", nullable = false)
    private String paymentStatus;
}

//CREATE TABLE Booking (
//  BookingId INT PRIMARY KEY,
//  Booking_date DATETIME,
//  Payment_status NVARCHAR(50)
//);