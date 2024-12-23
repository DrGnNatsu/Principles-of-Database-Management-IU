package org.example.backend.repository;

import org.example.backend.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Passenger p WHERE p.passengerID = :passengerID")
    void deleteByPassengerID(@Param("passengerID") String passengerID);

    @Query("SELECT p FROM Passenger p ORDER BY p.passengerID DESC LIMIT 1")
    Optional<Passenger> findFirstByOrderByPassengerIDDesc();

}