package asoc.api.services;

import asoc.api.entity.ActividadProgramada;
import asoc.api.repository.ActividadProgramadaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActividadProgramadaService {

    private final ActividadProgramadaRepository actividadRepository;

    public ActividadProgramadaService(ActividadProgramadaRepository actividadRepository) {
        this.actividadRepository = actividadRepository;
    }

    public List<ActividadProgramada> listarTodas() {
        return actividadRepository.findAll();
    }

    public List<ActividadProgramada> listarPorServicio(Long servicioId) {
        return actividadRepository.findByServicioId(servicioId);
    }

    public Optional<ActividadProgramada> obtenerPorId(Long id) {
        return actividadRepository.findById(id);
    }

    public ActividadProgramada crear(ActividadProgramada actividad) {
        // Lógica de negocio: al crear, el disponible es igual al máximo
        actividad.setCupoDisponible(actividad.getCupoMaximo());
        return actividadRepository.save(actividad);
    }

    public Optional<ActividadProgramada> actualizar(Long id, ActividadProgramada datos) {
        return actividadRepository.findById(id).map(a -> {
            a.setFechaHora(datos.getFechaHora());
            a.setCupoMaximo(datos.getCupoMaximo());
            a.setCupoDisponible(datos.getCupoDisponible());
            a.setEstado(datos.getEstado());
            return actividadRepository.save(a);
        });
    }

    public boolean eliminar(Long id) {
        if (actividadRepository.existsById(id)) {
            actividadRepository.deleteById(id);
            return true;
        }
        return false;
    }
}