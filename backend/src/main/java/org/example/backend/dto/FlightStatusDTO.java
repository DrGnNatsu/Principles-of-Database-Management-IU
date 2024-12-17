package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlightStatusDTO {
    private String status;

    public FlightStatusDTO(String status) {
        this.status = status;
    }
}
