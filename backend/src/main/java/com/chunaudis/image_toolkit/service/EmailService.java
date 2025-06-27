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
        String subject = "Password Reset Request";
        String resetLink = "http://localhost:3000/reset-password?token=" + token; // Change to your frontend URL

        String text = "Hello!\n\n"
                    + "You received this email because you requested to reset your password.\n\n"
                    + "Please click the link below or copy and paste it into your browser:\n"
                    + resetLink + "\n\n"
                    + "If you did not request a password reset, please ignore this message.\n\n"
                    + "Best regards,\n"
                    + "The Chunaudis Team";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
