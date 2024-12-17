package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AirportDTO {

    private String airportName;
    private String country;
    private String city;

    public AirportDTO(String airportName, String country, String city) {
        this.airportName = airportName;
        this.country = country;
        this.city = city;
    }

}
