package asoc.api.services;

import asoc.api.entity.MiembrosDirectiva;
import asoc.api.repository.MiembroDirectivaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MiembroDirectivaService {

    private final MiembroDirectivaRepository directivaRepository;

    public MiembroDirectivaService(MiembroDirectivaRepository directivaRepository) {
        this.directivaRepository = directivaRepository;
    }

    public List<MiembrosDirectiva> listarTodos() {
        return directivaRepository.findAll();
    }

    public Optional<MiembrosDirectiva> obtenerPorId(Long id) {
        return directivaRepository.findById(id);
    }

    public MiembrosDirectiva crear(MiembrosDirectiva miembro) {
        return directivaRepository.save(miembro);
    }

    public Optional<MiembrosDirectiva> actualizar(Long id, MiembrosDirectiva datos) {
        return directivaRepository.findById(id).map(m -> {
            m.setNombre(datos.getNombre());
            m.setPuesto(datos.getPuesto());
            m.setBiografia(datos.getBiografia());
            m.setFotoUrl(datos.getFotoUrl());
            m.setOrdenPrioridad(datos.getOrdenPrioridad());
            return directivaRepository.save(m);
        });
    }

    public boolean eliminar(Long id) {
        if (directivaRepository.existsById(id)) {
            directivaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}