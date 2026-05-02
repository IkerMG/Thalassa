package com.thalassa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ThalassaApplication {

  public static void main(String[] args) {
    SpringApplication.run(ThalassaApplication.class, args);
  }
}
