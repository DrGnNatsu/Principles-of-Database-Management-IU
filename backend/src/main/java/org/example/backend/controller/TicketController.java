package org.example.backend.controller;

import org.example.backend.dto.TicketDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.entity.Ticket;
import org.example.backend.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        Ticket ticket = ticketService.getTicketById(id);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/admin")
    public ResponseEntity<Ticket> saveTicket(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.saveTicket(ticket));
    }

    @DeleteMapping("/{ticketID}")
    public ResponseEntity<?> deleteTicket(@PathVariable String ticketID) {
        try {
            ticketService.deleteTicketAndPassenger(ticketID);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getTicketsByEmail(@PathVariable String email) {
        List<Ticket> tickets = ticketService.getTicketsByEmail(email);
        if (tickets.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No tickets found for the provided email.");
        }
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/book")
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketDTO ticketDTO) {
        return ResponseEntity.ok(ticketService.createTicket(ticketDTO));
    }

}
