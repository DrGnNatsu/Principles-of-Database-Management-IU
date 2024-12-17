package org.example.backend.dto;

import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
public class SeatDTO {
    private SeatClassDTO seatClass;

    public SeatDTO(SeatClassDTO seatClass) {
        this.seatClass = seatClass;
    }

}
