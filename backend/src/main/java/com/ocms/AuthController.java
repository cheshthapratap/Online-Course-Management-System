package com.ocms;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.ocms.ApiErrors.err;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  public record Reg(@NotBlank String name, @NotBlank @Email String email, @NotBlank @Size(min = 8, message = "must be at least 8 characters") String password,
                    String role, String mobile, String city, String qualification, String guardianName, String guardianMobile) {}
  public record Login(@NotBlank String email, @NotBlank String password) {}
  @Autowired UserRepo users; @Autowired PasswordEncoder enc; @Autowired Jwt jwt;

  @PostMapping("/register")
  Map<String, String> register(@Valid @RequestBody Reg r) {
    String email = r.email().trim().toLowerCase();
    if (users.existsByEmail(email)) throw err(HttpStatus.CONFLICT, "This email is already registered");
    boolean teacher = "TEACHER".equalsIgnoreCase(r.role());   // admins can never self-register
    User u = new User();
    u.name = r.name().trim(); u.email = email; u.password = enc.encode(r.password());
    u.mobile = r.mobile(); u.city = r.city(); u.qualification = r.qualification();
    u.guardianName = r.guardianName(); u.guardianMobile = r.guardianMobile();
    u.role = teacher ? User.Role.TEACHER : User.Role.STUDENT;
    u.status = teacher ? User.Status.PENDING : User.Status.ACTIVE;
    users.save(u);
    return Map.of("message", teacher ? "Registered. An admin must approve your account before you can log in." : "Registered. You can log in now.");
  }

  @PostMapping("/login")
  Map<String, Object> login(@Valid @RequestBody Login r) {
    User u = users.findByEmail(r.email().trim().toLowerCase()).orElse(null);
    if (u == null || !enc.matches(r.password(), u.password)) throw err(HttpStatus.UNAUTHORIZED, "Wrong email or password");
    if (u.status == User.Status.PENDING) throw err(HttpStatus.FORBIDDEN, "Your account is waiting for admin approval");
    if (u.status != User.Status.ACTIVE) throw err(HttpStatus.FORBIDDEN, "Your account is suspended. Contact the administrator");
    return Map.of("token", jwt.make(u.email), "user", u);
  }
}
