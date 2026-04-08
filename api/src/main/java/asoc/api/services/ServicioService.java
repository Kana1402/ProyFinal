package asoc.api.services;

import asoc.api.entity.Servicio;
import asoc.api.repository.ServicioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;

    public ServicioService(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    public List<Servicio> listarTodos() {
        return servicioRepository.findAll();
    }

    public Optional<Servicio> obtenerPorId(Long id) {
        return servicioRepository.findById(id);
    }

    public Servicio crear(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public Optional<Servicio> actualizar(Long id, Servicio datos) {
        return servicioRepository.findById(id).map(s -> {
            s.setTitulo(datos.getTitulo());
            s.setDescripcion(datos.getDescripcion());
            s.setPrecio(datos.getPrecio());
            s.setImagenUrl(datos.getImagenUrl());
            return servicioRepository.save(s);
        });
    }

    public boolean eliminar(Long id) {
        if (servicioRepository.existsById(id)) {
            servicioRepository.deleteById(id);
            return true;
        }
        return false;
    }
}