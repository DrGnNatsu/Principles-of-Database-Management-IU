package org.example.backend.controller;

import org.example.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/api/employee/{employeeID}")
    public ResponseEntity<?> getAllEmployeesByID(@PathVariable String employeeID) {
        return ResponseEntity.ok(employeeService.getAllEmployeesByID(employeeID));
    }

    @GetMapping("/api/employeeID/{employeeID}")
    public ResponseEntity<?> getEmployeeID(@PathVariable String employeeID) {
        return ResponseEntity.ok(employeeService.getEmployeeID(employeeID));
    }

}
