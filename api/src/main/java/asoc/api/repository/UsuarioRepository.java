package asoc.api.repository;

import asoc.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Útil para el login y seguridad
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByCorreo(String correo);

}