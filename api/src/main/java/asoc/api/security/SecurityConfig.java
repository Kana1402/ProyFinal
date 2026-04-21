package asoc.api.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // Autenticación: público total
                        .requestMatchers("/api/auth/**").permitAll()
                        // Contenido público (VISITANTE puede leer sin token)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/noticias/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/servicios/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/actividades/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/directiva/**").permitAll()
                        // Reservas: requieren autenticación mínima (USUARIO o ADMIN)
                        .requestMatchers("/api/reservas/**").authenticated()
                        // Gestión de usuarios: solo ADMINISTRADOR
                        .requestMatchers("/api/usuarios/**").hasRole("ADMINISTRADOR")
                        // Permitir la ruta de error por defecto de Spring Boot para evitar 403 en excepciones
                        .requestMatchers("/error").permitAll()
                        // Cualquier otra ruta requiere autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}