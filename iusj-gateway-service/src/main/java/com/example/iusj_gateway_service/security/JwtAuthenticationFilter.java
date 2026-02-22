package com.example.iusj_gateway_service.security;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            System.out.println("=== JWT Filter Debug ===");
            System.out.println("Request URI: " + request.getURI());
            System.out.println("Request Method: " + request.getMethod());

            // Les requêtes OPTIONS sont gérées par CorsConfig, mais au cas où
            if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                System.out.println("OPTIONS request - passing through");
                return chain.filter(exchange);
            }
            
            // Extraire le token du header Authorization
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            System.out.println("Authorization Header: " + (authHeader != null ? authHeader.substring(0, Math.min(30, authHeader.length())) + "..." : "null"));
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("ERROR: Token JWT manquant ou format incorrect");
                return onError(exchange, "Token JWT manquant", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7); // Enlever "Bearer "
            System.out.println("Token extracted: " + token.substring(0, Math.min(20, token.length())) + "...");

            // Valider le token
            if (!jwtUtil.validateToken(token)) {
                System.out.println("ERROR: Token JWT invalide");
                return onError(exchange, "Token JWT invalide", HttpStatus.UNAUTHORIZED);
            }

            // Vérifier l'expiration
            if (jwtUtil.isTokenExpired(token)) {
                System.out.println("ERROR: Token JWT expiré");
                return onError(exchange, "Token JWT expiré", HttpStatus.UNAUTHORIZED);
            }

            // Extraire les informations utilisateur
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            
            System.out.println("Token valid - Username: " + username + ", Role: " + role);

            // Ajouter les informations utilisateur aux headers pour les services en aval
            ServerHttpRequest modifiedRequest = request.mutate()
                .header("X-User-Name", username)
                .header("X-User-Role", role)
                .build();

            ServerWebExchange modifiedExchange = exchange.mutate()
                .request(modifiedRequest)
                .build();

            System.out.println("=== JWT Filter Success ===");
            return chain.filter(modifiedExchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        
        // Ajouter les headers CORS pour que le navigateur puisse lire la réponse d'erreur
        // Utiliser set() au lieu de add() pour éviter les doublons
        String origin = exchange.getRequest().getHeaders().getOrigin();
        if (origin != null && origin.startsWith("http://localhost")) {
            response.getHeaders().set("Access-Control-Allow-Origin", origin);
        } else {
            response.getHeaders().set("Access-Control-Allow-Origin", "http://localhost:4200");
        }
        response.getHeaders().set("Access-Control-Allow-Credentials", "true");
        response.getHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.getHeaders().set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With");
        response.getHeaders().set("Content-Type", "application/json");
        
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        
        return response.writeWith(
            Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }

    public static class Config {
        // Configuration du filtre si nécessaire
    }
}