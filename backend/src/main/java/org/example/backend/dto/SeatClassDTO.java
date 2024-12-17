package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatClassDTO {
    private String classType;

    public SeatClassDTO(String classType) {
        this.classType = classType;
    }
}
