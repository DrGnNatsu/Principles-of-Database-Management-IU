package org.example.backend.repository;

import org.example.backend.entity.AirportStaff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AirportStaffRepository extends JpaRepository <AirportStaff, Long> {}
