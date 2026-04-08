package asoc.api.controller;

import asoc.api.entity.EstadoReserva;
import asoc.api.entity.Reserva;
import asoc.api.repository.ReservaRepository;
import asoc.api.services.ReservaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final ReservaRepository reservaRepository;

    public ReservaController(ReservaService reservaService, ReservaRepository reservaRepository) {
        this.reservaService = reservaService;
        this.reservaRepository = reservaRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Reserva> listarTodas() {
        return reservaService.listarTodas();
    }

    @GetMapping("/mis-reservas/{usuarioId}")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public List<Reserva> listarPorUsuario(@PathVariable Long usuarioId) {
        return reservaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/actividad/{actividadId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Reserva> listarPorActividad(@PathVariable Long actividadId) {
        return reservaService.listarPorActividad(actividadId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public ResponseEntity<Reserva> obtenerPorId(@PathVariable Long id) {
        return reservaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public ResponseEntity<?> crear(@RequestBody Reserva reserva) {
        try {
            Reserva nueva = reservaService.crearReserva(reserva);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,
                                           @RequestParam EstadoReserva estado) {
        try {
            return ResponseEntity.ok(reservaService.cambiarEstado(id, estado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!reservaRepository.existsById(id)) return ResponseEntity.notFound().build();
        reservaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}