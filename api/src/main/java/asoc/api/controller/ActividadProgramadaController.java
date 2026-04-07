package asoc.api.controller;

import asoc.api.entity.ActividadProgramada;
import asoc.api.repository.ActividadProgramadaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadProgramadaController {

    private final ActividadProgramadaRepository actividadRepository;

    public ActividadProgramadaController(ActividadProgramadaRepository actividadRepository) {
        this.actividadRepository = actividadRepository;
    }

    // Público: ver todas las actividades disponibles
    @GetMapping
    public List<ActividadProgramada> listarTodas() {
        return actividadRepository.findAll();
    }

    // Público: ver actividades de un servicio específico
    @GetMapping("/servicio/{servicioId}")
    public List<ActividadProgramada> listarPorServicio(@PathVariable Long servicioId) {
        return actividadRepository.findByServicioId(servicioId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActividadProgramada> obtenerPorId(@PathVariable Long id) {
        return actividadRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ActividadProgramada> crear(@RequestBody ActividadProgramada actividad) {
        // cupoDisponible arranca igual al cupoMaximo al crear
        actividad.setCupoDisponible(actividad.getCupoMaximo());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actividadRepository.save(actividad));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ActividadProgramada> actualizar(@PathVariable Long id,
                                                          @RequestBody ActividadProgramada datos) {
        return actividadRepository.findById(id).map(a -> {
            a.setFechaHora(datos.getFechaHora());
            a.setCupoMaximo(datos.getCupoMaximo());
            a.setCupoDisponible(datos.getCupoDisponible());
            a.setEstado(datos.getEstado());
            return ResponseEntity.ok(actividadRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!actividadRepository.existsById(id)) return ResponseEntity.notFound().build();
        actividadRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}