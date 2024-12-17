package org.example.backend.service;

import org.example.backend.entity.FlightBase;
import org.example.backend.repository.FlightBaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class FlightBaseService {

    @Autowired
    private FlightBaseRepository flightBaseRepository;

    public List<FlightBase> searchFlights(
            String departure,
            String arrival,
            LocalDate departureDate,
            LocalDate arrivalDate) {
        return flightBaseRepository.searchFlights(departure, arrival, departureDate, arrivalDate);
    }
}