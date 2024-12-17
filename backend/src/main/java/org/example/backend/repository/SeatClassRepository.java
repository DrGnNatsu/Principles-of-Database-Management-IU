package org.example.backend.repository;

import org.example.backend.entity.SeatClass;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatClassRepository extends JpaRepository<SeatClass, Long> {

}
