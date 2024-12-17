package org.example.backend.repository;

import org.example.backend.entity.Seat;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatRepository extends CrudRepository<Seat, String> { // Assuming Seat is your entity and the primary key is String

    @Query("SELECT MIN(s.seatNumber) " +
            "FROM Seat s " +
            "JOIN SeatClass sc ON s.seatClass.classType = sc.classType " +
            "WHERE s.seatClass.classType = :classType " +
            "  AND s.seatNumber NOT IN (SELECT t.seat.seatNumber FROM Ticket t WHERE t.flightBase.flightID = :flightID) " + // Fixed the alias here
            "  AND s.seatNumber BETWEEN " +
            "      CASE " +
            "          WHEN s.seatClass.classType = 'First Class' THEN 'SE001' " +
            "          WHEN s.seatClass.classType = 'Business' THEN 'SE011' " +
            "          WHEN s.seatClass.classType = 'Economy' THEN 'SE031' " +
            "          ELSE NULL " +
            "      END " +
            "      AND " +
            "      CASE " +
            "          WHEN s.seatClass.classType = 'First Class' THEN 'SE010' " +
            "          WHEN s.seatClass.classType = 'Business' THEN 'SE030' " +
            "          WHEN s.seatClass.classType = 'Economy' THEN 'SE300' " +
            "          ELSE NULL " +
            "      END")
    String findFirstByFlightIDAndClassTypeAndTicketIsNull(@Param("flightID") String flightID, @Param("classType") String classType);

}
