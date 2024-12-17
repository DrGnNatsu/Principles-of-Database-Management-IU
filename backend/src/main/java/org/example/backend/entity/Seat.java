package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "seat")
@Entity
public class Seat {

    @Id
    @Column(name = "seat_number", nullable = false, length = 5)
    private String seatNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_type", insertable = false, updatable = false)
    private SeatClass seatClass;
}
