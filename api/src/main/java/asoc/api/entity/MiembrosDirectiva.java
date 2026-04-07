package asoc.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "miembros_directiva")
@Getter
@Setter
@NoArgsConstructor
public class MiembrosDirectiva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String puesto;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    private String fotoUrl;

    private Integer ordenPrioridad;
}