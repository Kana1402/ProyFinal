package asoc.api.controller;

import asoc.api.entity.MiembrosDirectiva;
import asoc.api.repository.MiembroDirectivaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directiva")
public class MiembroDirectivaController {

    private final MiembroDirectivaRepository directivaRepository;

    public MiembroDirectivaController(MiembroDirectivaRepository directivaRepository) {
        this.directivaRepository = directivaRepository;
    }

    // Público: cualquier visitante puede ver la directiva
    @GetMapping
    public List<MiembrosDirectiva> listarTodos() {
        return directivaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MiembrosDirectiva> obtenerPorId(@PathVariable Long id) {
        return directivaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MiembrosDirectiva> crear(@RequestBody MiembrosDirectiva miembro) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(directivaRepository.save(miembro));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<MiembrosDirectiva> actualizar(@PathVariable Long id,
                                                        @RequestBody MiembrosDirectiva datos) {
        return directivaRepository.findById(id).map(m -> {
            m.setNombre(datos.getNombre());
            m.setPuesto(datos.getPuesto());
            m.setBiografia(datos.getBiografia());
            m.setFotoUrl(datos.getFotoUrl());
            m.setOrdenPrioridad(datos.getOrdenPrioridad());
            return ResponseEntity.ok(directivaRepository.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!directivaRepository.existsById(id)) return ResponseEntity.notFound().build();
        directivaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}