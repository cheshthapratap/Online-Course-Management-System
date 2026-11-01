package com.ocms;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Component
public class Jwt {
  private final SecretKey key;
  public Jwt(@Value("${app.jwt.secret}") String secret) { key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }
  public String make(String email) { return Jwts.builder().subject(email).expiration(new Date(System.currentTimeMillis() + 8 * 3600_000L)).signWith(key).compact(); }
  public String subject(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject(); }
}
