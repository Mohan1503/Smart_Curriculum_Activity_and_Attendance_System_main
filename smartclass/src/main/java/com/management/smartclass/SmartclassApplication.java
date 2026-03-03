package com.management.smartclass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartclassApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartclassApplication.class, args);
	}

}
