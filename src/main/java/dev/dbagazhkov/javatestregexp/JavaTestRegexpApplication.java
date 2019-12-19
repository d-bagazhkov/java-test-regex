package dev.dbagazhkov.javatestregexp;

import com.hubspot.jinjava.Jinjava;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class JavaTestRegexpApplication {

    @Bean
    public Jinjava jinjava() {
        return new Jinjava();
    }

    public static void main(String[] args) {
        SpringApplication.run(JavaTestRegexpApplication.class, args);
    }

}
