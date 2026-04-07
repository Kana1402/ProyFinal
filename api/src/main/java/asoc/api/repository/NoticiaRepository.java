package asoc.api.repository;

import asoc.api.entity.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    // Traer las últimas noticias primero
    List<Noticia> findAllByOrderByFechaPublicacionDesc();
}