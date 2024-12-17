package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Getter
@Setter
public class BookingDTO {
    private Date bookingDate;
    private String paymentStatus;

    public BookingDTO(Date bookingDate, String paymentStatus) {
        this.bookingDate = bookingDate;
        this.paymentStatus = paymentStatus;
    }
}
