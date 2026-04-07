package asoc.api.controller;

import asoc.api.entity.Reserva;
import asoc.api.repository.ReservaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaRepository reservaRepository;

    public ReservaController(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    // ADMINISTRADOR: ver todas las reservas
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    // USUARIO: ver su propio historial de reservas
    @GetMapping("/mis-reservas/{usuarioId}")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public List<Reserva> listarPorUsuario(@PathVariable Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    // ADMINISTRADOR: ver reservas de una actividad específica
    @GetMapping("/actividad/{actividadId}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<Reserva> listarPorActividad(@PathVariable Long actividadId) {
        return reservaRepository.findByActividadId(actividadId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public ResponseEntity<Reserva> obtenerPorId(@PathVariable Long id) {
        return reservaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // USUARIO: crear una reserva
    @PostMapping
    @PreAuthorize("hasAnyRole('USUARIO', 'ADMINISTRADOR')")
    public ResponseEntity<Reserva> crear(@RequestBody Reserva reserva) {
        // TODO: validar cupoDisponible en la actividad y descontarlo
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservaRepository.save(reserva));
    }

    // ADMINISTRADOR: cambiar estado de una reserva (confirmar, cancelar)
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Reserva> cambiarEstado(@PathVariable Long id,
                                                  @RequestParam asoc.api.entity.EstadoReserva estado) {
        return reservaRepository.findById(id).map(r -> {
            r.setEstado(estado);
            return ResponseEntity.ok(reservaRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!reservaRepository.existsById(id)) return ResponseEntity.notFound().build();
        reservaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}