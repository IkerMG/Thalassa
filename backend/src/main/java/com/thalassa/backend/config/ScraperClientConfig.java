package com.thalassa.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class ScraperClientConfig {

    /**
     * RestClient preconfigurado para el microservicio Python.
     *
     * - baseUrl inyectada desde python.service.url (con fallback a localhost:8001).
     * - Timeout de conexión y lectura: 8 segundos.
     * - SimpleClientHttpRequestFactory: usa JDK HttpURLConnection,
     *   sin necesidad de dependencias adicionales.
     */
    @Bean
    public RestClient scraperRestClient(
            @Value("${python.service.url}") String baseUrl) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(8));
        factory.setReadTimeout(Duration.ofSeconds(8));

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
