package asoc.api.repository;

import asoc.api.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    // Puedes agregar filtros por precio o título si lo ocupas luego
}