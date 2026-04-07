package asoc.api.repository;

import asoc.api.entity.MiembrosDirectiva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MiembroDirectivaRepository extends JpaRepository<MiembrosDirectiva, Long> {
    // Traer ordenados por la prioridad que definimos
    List<MiembrosDirectiva> findAllByOrderByOrdenPrioridadAsc();
}