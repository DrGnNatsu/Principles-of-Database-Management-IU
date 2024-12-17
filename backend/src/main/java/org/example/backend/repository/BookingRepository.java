package org.example.backend.repository;

import org.example.backend.entity.Booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository <Booking, Long> {

    @Query("SELECT b FROM Booking b ORDER BY b.bookingID DESC LIMIT 1")
    Optional<Booking> findFirstByOrderByBookingIDDesc();

    @Modifying
    @Transactional
    @Query("DELETE FROM Booking b WHERE b.bookingID = :BookingID")
    void deleteByBookingID(@Param("BookingID") String BookingID);
}
