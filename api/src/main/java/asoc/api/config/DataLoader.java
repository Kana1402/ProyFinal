package asoc.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import asoc.api.entity.Role;
import asoc.api.entity.Usuario;
import asoc.api.repository.UsuarioRepository;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            if (usuarioRepository.findByUsername("admin").isEmpty()) {
                Usuario admin = new Usuario(
                        "admin",
                        passwordEncoder.encode("admin123"),
                        Role.ADMINISTRADOR
                );
                admin.setCorreo("admin@asoccahuita.cr");
                usuarioRepository.save(admin);
            }

            if (usuarioRepository.findByUsername("usuario1").isEmpty()) {
                Usuario usuario = new Usuario(
                        "usuario11",
                        passwordEncoder.encode("user123"),
                        Role.USUARIO
                );
                usuario.setCorreo("usuario1@gmail.com");
                usuarioRepository.save(usuario);
            }
        };
    }
}