package org.example.backend.service;

import org.example.backend.entity.Employee;
import org.example.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public boolean employeeExists(String employeeID) {
        return !employeeRepository.findAllByEmployeeID(employeeID).isEmpty();
    }

    public List<Employee> getAllEmployeesByID(String employeeID) {
        if (employeeExists(employeeID)) {
            return employeeRepository.findAllByEmployeeID(employeeID);
        } else {
            throw new IllegalArgumentException("Employee ID not found");
        }
    }

    public List<String> getEmployeeID(String employeeID) {
        return employeeRepository.findByEmployeeID(employeeID);
    }
}