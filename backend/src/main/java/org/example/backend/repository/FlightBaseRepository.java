package org.example.backend.repository;

import org.example.backend.entity.FlightBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FlightBaseRepository extends JpaRepository<FlightBase, Long> {
    @Query("SELECT fb FROM FlightBase fb " +
            "JOIN fb.flightSchedule fs " +
            "JOIN fb.airport a " +
            "WHERE (:departure IS NULL OR fs.departure LIKE %:departure%) " +
            "AND (:arrival IS NULL OR fs.arrival LIKE %:arrival%) " +
            "AND (:departureDate IS NULL OR DATE(fs.departureDate) = DATE(:departureDate)) " +
            "AND (:arrivalDate IS NULL OR DATE(fs.arrivalDate) = DATE(:arrivalDate))")
    List<FlightBase> searchFlights(
            @Param("departure") String departure,
            @Param("arrival") String arrival,
            @Param("departureDate") LocalDate departureDate,
            @Param("arrivalDate") LocalDate arrivalDate
    );

    @Query("SELECT fb FROM FlightBase fb WHERE fb.flightID = :flightID")
    FlightBase findByFlightID(@Param("flightID") String flightID);
}
