package asoc.api.services;

import asoc.api.entity.Noticia;
import asoc.api.entity.Reserva;
import asoc.api.entity.Usuario;
import asoc.api.repository.NoticiaRepository;
import asoc.api.repository.ReservaRepository;
import asoc.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService { 

    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final NoticiaRepository noticiaRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, ReservaRepository reservaRepository, NoticiaRepository noticiaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.reservaRepository = reservaRepository;
        this.noticiaRepository = noticiaRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> actualizar(Long id, Usuario datos) {
        return usuarioRepository.findById(id).map(u -> {
            u.setUsername(datos.getUsername());
            u.setCorreo(datos.getCorreo());
            u.setTelefono(datos.getTelefono());
            u.setRole(datos.getRole());
            return usuarioRepository.save(u);
        });
    }

    @Transactional
    public boolean eliminar(Long id) {
        if (usuarioRepository.existsById(id)) {
            // 1. Desvincular autor de las noticias
            List<Noticia> noticias = noticiaRepository.findByAutorId(id);
            for (Noticia noticia : noticias) {
                noticia.setAutor(null);
                noticiaRepository.save(noticia);
            }
            
            // 2. Eliminar reservas asociadas al usuario
            List<Reserva> reservas = reservaRepository.findByUsuarioId(id);
            reservaRepository.deleteAll(reservas);
            
            // 3. Eliminar el usuario
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
}