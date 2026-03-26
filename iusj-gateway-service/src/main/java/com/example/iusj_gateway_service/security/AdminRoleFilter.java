package com.example.iusj_gateway_service.security;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class AdminRoleFilter extends AbstractGatewayFilterFactory<AdminRoleFilter.Config> {

    private final JwtUtil jwtUtil;

    public AdminRoleFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // Extraire le token du header Authorization
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Token JWT manquant", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // Valider le token
            if (!jwtUtil.validateToken(token)) {
                return onError(exchange, "Token JWT invalide", HttpStatus.UNAUTHORIZED);
            }

            // Vérifier le rôle ADMIN
            String role = jwtUtil.extractRole(token);
            if (!"ADMIN".equals(role)) {
                return onError(exchange, "Accès refusé - Rôle ADMIN requis", HttpStatus.FORBIDDEN);
            }

            // Ajouter les informations utilisateur aux headers
            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);
            if (username == null || userId == null) {
                return onError(exchange, "Claims JWT manquantes", HttpStatus.UNAUTHORIZED);
            }
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Name", username)
                .header("X-User-Role", role)
                .header("X-User-Id", String.valueOf(userId))
                .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        
        return response.writeWith(
            Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }

    public static class Config {
        // Configuration du filtre si nécessaire
    }
}