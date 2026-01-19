package com.example.iusj_teacher_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

/**
 * Filtre qui lit les headers X-User-Name et X-User-Role du gateway
 * et établit le contexte de sécurité Spring
 */
@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String username = request.getHeader("X-User-Name");
        String role = request.getHeader("X-User-Role");

        if (username != null && !username.isEmpty()) {
            // Créer une collection d'autorités
            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            
            if (role != null && !role.isEmpty()) {
                // Ajouter le rôle avec le préfixe ROLE_
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }

            // Créer un token d'authentification
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(username, null, authorities);

            // Définir le contexte de sécurité
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            System.out.println("HeaderAuthenticationFilter: Authentification établie pour " + username + " avec rôle " + role);
        }

        filterChain.doFilter(request, response);
    }
}
