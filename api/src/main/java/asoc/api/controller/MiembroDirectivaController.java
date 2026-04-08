package asoc.api.controller;

import asoc.api.entity.MiembrosDirectiva;
import asoc.api.services.MiembroDirectivaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directiva")
public class MiembroDirectivaController {

    private final MiembroDirectivaService directivaService;

    public MiembroDirectivaController(MiembroDirectivaService directivaService) {
        this.directivaService = directivaService;
    }

    @GetMapping
    public List<MiembrosDirectiva> listarTodos() {
        return directivaService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MiembrosDirectiva> obtenerPorId(@PathVariable Long id) {
        return directivaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MiembrosDirectiva> crear(@RequestBody MiembrosDirectiva miembro) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(directivaService.crear(miembro));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MiembrosDirectiva> actualizar(@PathVariable Long id, 
                                                        @RequestBody MiembrosDirectiva datos) {
        return directivaService.actualizar(id, datos)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (directivaService.eliminar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}