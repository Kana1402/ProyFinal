package asoc.api.controller;

import asoc.api.entity.Servicio;
import asoc.api.repository.ServicioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository servicioRepository;

    public ServicioController(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    // Público: cualquier visitante puede ver los servicios
    @GetMapping
    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> obtenerPorId(@PathVariable Long id) {
        return servicioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Solo ADMINISTRADOR puede crear, editar o eliminar
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Servicio> crear(@RequestBody Servicio servicio) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(servicioRepository.save(servicio));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Servicio> actualizar(@PathVariable Long id, @RequestBody Servicio datos) {
        return servicioRepository.findById(id).map(s -> {
            s.setTitulo(datos.getTitulo());
            s.setDescripcion(datos.getDescripcion());
            s.setPrecio(datos.getPrecio());
            s.setImagenUrl(datos.getImagenUrl());
            return ResponseEntity.ok(servicioRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!servicioRepository.existsById(id)) return ResponseEntity.notFound().build();
        servicioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}