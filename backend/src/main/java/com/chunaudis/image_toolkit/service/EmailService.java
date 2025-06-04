package com.chunaudis.image_toolkit.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Recuperación de contraseña";
      String resetLink = "http://localhost:3000/reset-password?token=" + token;// Cambia esta URL por la de tu frontend

        String text = "Hola!\n\n"
                    + "Recibiste este correo porque solicitaste recuperar tu contraseña.\n\n"
                    + "Haz clic en el siguiente enlace o cópialo en tu navegador:\n"
                    + resetLink + "\n\n"
                    + "Si no fuiste tú, ignora este mensaje.\n\n"
                    + "Saludos,\n"
                    + "El equipo de Chunaudis";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
