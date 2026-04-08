package asoc.api.services;

import asoc.api.entity.Noticia;
import asoc.api.repository.NoticiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoticiaService {

    private final NoticiaRepository noticiaRepository;

    public NoticiaService(NoticiaRepository noticiaRepository) {
        this.noticiaRepository = noticiaRepository;
    }

    public List<Noticia> listarTodas() {
        return noticiaRepository.findAll();
    }

    public Optional<Noticia> obtenerPorId(Long id) {
        return noticiaRepository.findById(id);
    }

    public Noticia crear(Noticia noticia) {
        return noticiaRepository.save(noticia);
    }

    public Optional<Noticia> actualizar(Long id, Noticia datos) {
        return noticiaRepository.findById(id).map(n -> {
            n.setTitulo(datos.getTitulo());
            n.setContenido(datos.getContenido());
            n.setImagenUrl(datos.getImagenUrl());
            n.setAutor(datos.getAutor());
            return noticiaRepository.save(n);
        });
    }

    public boolean eliminar(Long id) {
        if (noticiaRepository.existsById(id)) {
            noticiaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}