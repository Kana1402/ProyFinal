package asoc.api.controller;

import asoc.api.entity.Noticia;
import asoc.api.repository.NoticiaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    private final NoticiaRepository noticiaRepository;

    public NoticiaController(NoticiaRepository noticiaRepository) {
        this.noticiaRepository = noticiaRepository;
    }

    // Público: cualquier visitante puede leer noticias
    @GetMapping
    public List<Noticia> listarTodas() {
        return noticiaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Noticia> obtenerPorId(@PathVariable Long id) {
        return noticiaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Noticia> crear(@RequestBody Noticia noticia) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noticiaRepository.save(noticia));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Noticia> actualizar(@PathVariable Long id, @RequestBody Noticia datos) {
        return noticiaRepository.findById(id).map(n -> {
            n.setTitulo(datos.getTitulo());
            n.setContenido(datos.getContenido());
            n.setImagenUrl(datos.getImagenUrl());
            n.setAutor(datos.getAutor());
            return ResponseEntity.ok(noticiaRepository.save(n));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!noticiaRepository.existsById(id)) return ResponseEntity.notFound().build();
        noticiaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}