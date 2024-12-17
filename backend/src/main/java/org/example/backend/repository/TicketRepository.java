package org.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.example.backend.entity.Ticket;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t WHERE t.ticketID = :ticketID")
    Ticket findByTicketID(@Param("ticketID") String ticketID);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.passenger.passengerID = :passengerID")
    int countByPassengerID(@Param("passengerID") String passengerID);

    @Query("SELECT DISTINCT t FROM Ticket t " +
           "LEFT JOIN FETCH t.passenger " +
           "LEFT JOIN FETCH t.booking " +
           "LEFT JOIN FETCH t.seat s " +
           "LEFT JOIN FETCH s.seatClass " +
           "LEFT JOIN FETCH t.flightBase " +
           "WHERE t.passenger.email = :email")
    List<Ticket> findAllByPassengerID_Email(@Param("email") String email);

    @Modifying  // Required for modifying queries
    @Transactional // Ensures transaction management
    @Query("DELETE FROM Ticket t WHERE t.ticketID = :ticketID")
    void deleteByTicketID(@Param("ticketID") String ticketID);

    @Query("SELECT t FROM Ticket t ORDER BY t.ticketID DESC LIMIT 1")
    Optional<Ticket> findFirstByOrderByTicketIDDesc();
}
