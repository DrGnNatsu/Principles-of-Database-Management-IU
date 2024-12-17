package org.example.backend.repository;

import org.example.backend.entity.FlightCrew;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlightCrewRepository extends JpaRepository<FlightCrew, Long> {

}
