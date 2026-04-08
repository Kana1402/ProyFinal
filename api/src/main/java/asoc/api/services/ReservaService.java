package asoc.api.services;

import asoc.api.entity.ActividadProgramada;
import asoc.api.entity.EstadoReserva;
import asoc.api.entity.Reserva;
import asoc.api.repository.ActividadProgramadaRepository;
import asoc.api.repository.ReservaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ActividadProgramadaRepository actividadRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          ActividadProgramadaRepository actividadRepository) {
        this.reservaRepository = reservaRepository;
        this.actividadRepository = actividadRepository;
    }

    @Transactional
    public Reserva crearReserva(Reserva reserva) {
        ActividadProgramada actividad = actividadRepository
                .findById(reserva.getActividad().getId())
                .orElseThrow(() -> new RuntimeException("Actividad no encontrada"));

        if (actividad.getCupoDisponible() < reserva.getCantidadPersonas()) {
            throw new RuntimeException("No hay suficientes cupos disponibles. Cupos restantes: "
                    + actividad.getCupoDisponible());
        }

        // Descontar cupos
        actividad.setCupoDisponible(actividad.getCupoDisponible() - reserva.getCantidadPersonas());
        actividadRepository.save(actividad);

        // Asignar estado inicial
        reserva.setEstado(EstadoReserva.PENDIENTE);

        return reservaRepository.save(reserva);
    }

    @Transactional
    public Reserva cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Si se cancela, devolver los cupos a la actividad
        if (nuevoEstado == EstadoReserva.CANCELADA
                && reserva.getEstado() != EstadoReserva.CANCELADA) {

            ActividadProgramada actividad = reserva.getActividad();
            actividad.setCupoDisponible(actividad.getCupoDisponible() + reserva.getCantidadPersonas());
            actividadRepository.save(actividad);
        }

        reserva.setEstado(nuevoEstado);
        return reservaRepository.save(reserva);
    }

    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    public List<Reserva> listarPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    public List<Reserva> listarPorActividad(Long actividadId) {
        return reservaRepository.findByActividadId(actividadId);
    }
}