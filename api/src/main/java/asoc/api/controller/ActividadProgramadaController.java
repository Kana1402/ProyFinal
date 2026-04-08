package asoc.api.controller;

import asoc.api.entity.ActividadProgramada;
import asoc.api.services.ActividadProgramadaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadProgramadaController {

    private final ActividadProgramadaService actividadService;

    public ActividadProgramadaController(ActividadProgramadaService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping
    public List<ActividadProgramada> listarTodas() {
        return actividadService.listarTodas();
    }

    @GetMapping("/servicio/{servicioId}")
    public List<ActividadProgramada> listarPorServicio(@PathVariable Long servicioId) {
        return actividadService.listarPorServicio(servicioId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActividadProgramada> obtenerPorId(@PathVariable Long id) {
        return actividadService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ActividadProgramada> crear(@RequestBody ActividadProgramada actividad) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actividadService.crear(actividad));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ActividadProgramada> actualizar(@PathVariable Long id,
                                                          @RequestBody ActividadProgramada datos) {
        return actividadService.actualizar(id, datos)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (actividadService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}