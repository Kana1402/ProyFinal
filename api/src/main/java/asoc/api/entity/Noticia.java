package asoc.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "noticias")
@Getter
@Setter
@NoArgsConstructor
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    private String imagenUrl;

    @Column(updatable = false)
    private LocalDateTime fechaPublicacion;

    @ManyToOne
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @PrePersist
    protected void onCreate() {
        this.fechaPublicacion = LocalDateTime.now();
    }
}