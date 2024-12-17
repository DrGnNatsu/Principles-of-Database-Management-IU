package org.example.backend.controller;

import org.example.backend.entity.FlightBase;
import org.example.backend.service.FlightBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flight-base")
@CrossOrigin(origins = "http://localhost:3000")
public class FlightBaseController {

    @Autowired
    private final FlightBaseService flightBaseService;

    public FlightBaseController(FlightBaseService flightBaseService) {
        this.flightBaseService = flightBaseService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<FlightBase>> searchFlights(
            @RequestParam(required = false) String departure,
            @RequestParam(required = false) String arrival,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate departureDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate arrivalDate) {

        List<FlightBase> flights = flightBaseService.searchFlights(
                departure, arrival, departureDate, arrivalDate);
        return ResponseEntity.ok(flights);
    }
}