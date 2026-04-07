package asoc.api.repository;

import asoc.api.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    // Ver las reservas de un usuario específico (para su perfil)
    List<Reserva> findByUsuarioId(Long usuarioId);
    
    // Ver reservas de una actividad (para el reporte del pescador)
    List<Reserva> findByActividadId(Long actividadId);
}