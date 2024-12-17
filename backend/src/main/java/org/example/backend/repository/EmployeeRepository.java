package org.example.backend.repository;

import org.example.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE e.employeeID = :employeeID")
    List<Employee> findAllByEmployeeID(@Param("employeeID") String employeeID);

    @Query("SELECT e FROM Employee e WHERE e.employeeID = :employeeID")
    List<String> findByEmployeeID(@Param("employeeID") String employeeID);

}