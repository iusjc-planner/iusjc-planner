package com.example.iusj_gateway_service.security;

import com.example.iusj_gateway_service.service.PasswordService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class PasswordEncodingFilter extends AbstractGatewayFilterFactory<PasswordEncodingFilter.Config> {

    private final PasswordService passwordService;
    private final ObjectMapper objectMapper;

    public PasswordEncodingFilter(PasswordService passwordService) {
        super(Config.class);
        this.passwordService = passwordService;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // Vérifier si c'est une requête POST ou PUT vers /api/users
            if ((HttpMethod.POST.equals(request.getMethod()) || HttpMethod.PUT.equals(request.getMethod())) 
                && request.getPath().toString().contains("/api/users")) {
                
                return DataBufferUtils.join(request.getBody())
                    .flatMap(dataBuffer -> {
                        try {
                            // Lire le body de la requête
                            byte[] bytes = new byte[dataBuffer.readableByteCount()];
                            dataBuffer.read(bytes);
                            DataBufferUtils.release(dataBuffer);
                            
                            String body = new String(bytes, StandardCharsets.UTF_8);
                            
                            // Parser le JSON
                            JsonNode jsonNode = objectMapper.readTree(body);
                            
                            // Vérifier s'il y a un champ password
                            if (jsonNode.has("password") && jsonNode.get("password").isTextual()) {
                                String password = jsonNode.get("password").asText();
                                
                                if (password != null && !password.isEmpty()) {
                                    // Encoder le mot de passe s'il n'est pas déjà encodé
                                    String encodedPassword = passwordService.encodePasswordIfNeeded(password);
                                    
                                    // Modifier le JSON avec le mot de passe encodé
                                    ((ObjectNode) jsonNode).put("password", encodedPassword);
                                    
                                    // Convertir le JSON modifié en bytes
                                    String modifiedBody = objectMapper.writeValueAsString(jsonNode);
                                    bytes = modifiedBody.getBytes(StandardCharsets.UTF_8);
                                }
                            }
                            
                            // Créer un nouveau DataBuffer avec le contenu modifié
                            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
                            Flux<DataBuffer> bodyFlux = Flux.just(buffer);
                            
                            // Créer une nouvelle requête avec le body modifié
                            ServerHttpRequest mutatedRequest = new ServerHttpRequestDecorator(request) {
                                @Override
                                public Flux<DataBuffer> getBody() {
                                    return bodyFlux;
                                }
                            };
                            
                            return chain.filter(exchange.mutate().request(mutatedRequest).build());
                            
                        } catch (Exception e) {
                            // En cas d'erreur, continuer avec la requête originale
                            return chain.filter(exchange);
                        }
                    });
            }
            
            return chain.filter(exchange);
        };
    }

    public static class Config {
        // Configuration si nécessaire
    }
}