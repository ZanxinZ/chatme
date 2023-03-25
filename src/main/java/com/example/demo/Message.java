package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;


public class Message {
    @Autowired
    String role;
    @Autowired
    String content;
}
