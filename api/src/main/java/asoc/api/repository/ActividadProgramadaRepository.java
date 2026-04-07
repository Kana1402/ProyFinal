package asoc.api.repository;

import asoc.api.entity.ActividadProgramada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActividadProgramadaRepository extends JpaRepository<ActividadProgramada, Long> {
    // Traer solo actividades que aún tienen espacio
    List<ActividadProgramada> findByCupoDisponibleGreaterThan(Integer cupo);
    
    // Traer actividades de un servicio específico
    List<ActividadProgramada> findByServicioId(Long servicioId);
}