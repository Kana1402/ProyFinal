package asoc.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import asoc.api.entity.Role;
import asoc.api.entity.Usuario;
import asoc.api.repository.UsuarioRepository;

@Configuration
public class DataLoader {

    @Value("${admin.user}")
    private String adminUser;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.correo}")
    private String adminCorreo;

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            // Inicializar Administrador
            if (usuarioRepository.findByUsername(adminUser).isEmpty() && 
                usuarioRepository.findByCorreo(adminCorreo).isEmpty()) {
                
                Usuario admin = new Usuario(
                        adminUser,
                        passwordEncoder.encode(adminPassword),
                        Role.ADMINISTRADOR
                );
                admin.setCorreo(adminCorreo);
                usuarioRepository.save(admin);
            }

            // Inicializar Usuario de Prueba
            String testUsername = "usuario1";
            String testEmail = "usuario1@gmail.com";
            
            if (usuarioRepository.findByUsername(testUsername).isEmpty() && 
                usuarioRepository.findByCorreo(testEmail).isEmpty()) {
                
                Usuario usuario = new Usuario(
                        testUsername,
                        passwordEncoder.encode("user123"),
                        Role.USUARIO
                );
                usuario.setCorreo(testEmail);
                usuarioRepository.save(usuario);
            }
        };
    }
}