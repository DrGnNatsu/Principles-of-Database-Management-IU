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
    @Column(name = "bookingid", nullable = false, length=5)
    private String bookingID;

    @Column(name = "booking_date", nullable = false)
    private Date bookingDate; // DATETIME

    @Column(name = "Payment_status", nullable = false)
    private String paymentStatus = "Pending";
}
