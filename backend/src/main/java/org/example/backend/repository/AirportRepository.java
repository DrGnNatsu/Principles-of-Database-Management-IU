package org.example.backend.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import org.example.backend.entity.Airport;

@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {}
