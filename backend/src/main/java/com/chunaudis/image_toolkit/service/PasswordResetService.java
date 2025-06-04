package com.chunaudis.image_toolkit.service;

import com.chunaudis.image_toolkit.entity.PasswordResetToken;
import com.chunaudis.image_toolkit.entity.User;
import com.chunaudis.image_toolkit.repository.PasswordResetTokenRepository;
import com.chunaudis.image_toolkit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;


@Service
public class PasswordResetService {
   private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;


    public PasswordResetService(UserRepository userRepository, PasswordResetTokenRepository tokenRepository,
                                EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

     @Transactional
    public Optional<String> createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Optional.empty(); // El email no está registrado
        }

        User user = userOpt.get();

        // Borramos tokens anteriores si existen
        tokenRepository.deleteByUser(user);

        // Creamos uno nuevo
        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiration(OffsetDateTime.now().plusMinutes(30)); // 30 minutos de validez
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        return Optional.of(token);
    }

    public boolean isTokenValid(String token) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        return tokenOpt.isPresent()
            && !tokenOpt.get().isUsed()
            && OffsetDateTime.now().isBefore(tokenOpt.get().getExpiration());
    }

    public Optional<User> getUserByValidToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(t -> !t.isUsed() && OffsetDateTime.now().isBefore(t.getExpiration()))
                .map(PasswordResetToken::getUser);
    }

    public void markTokenAsUsed(String token) {
        tokenRepository.findByToken(token).ifPresent(t -> {
            t.setUsed(true);
            tokenRepository.save(t);
        });
    }


    @Transactional
public boolean resetPassword(String tokenStr, String newPassword) {
    Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(tokenStr);

    if (tokenOpt.isEmpty()) {
        return false;
    }

    PasswordResetToken token = tokenOpt.get();

    if (token.isUsed() || token.getExpiration().isBefore(OffsetDateTime.now())) {
        return false;
    }

    User user = token.getUser();
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    token.setUsed(true);
    tokenRepository.save(token);

    return true;
}



public void createResetToken(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    String tokenStr = UUID.randomUUID().toString();
    OffsetDateTime expiration = OffsetDateTime.now().plusHours(1);

    PasswordResetToken token = new PasswordResetToken();
    token.setUser(user);
    token.setToken(tokenStr);
    token.setExpiration(expiration);
    token.setUsed(false);

    tokenRepository.save(token);

    // Enviamos el correo con el token
    emailService.sendPasswordResetEmail(email, tokenStr);
}


}
