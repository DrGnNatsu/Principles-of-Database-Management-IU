package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AirlineDTO {

    private String airlineName;

    public AirlineDTO(String airlineName) {
        this.airlineName = airlineName;
    }

}
