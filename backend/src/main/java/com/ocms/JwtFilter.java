package com.ocms;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
public class JwtFilter extends OncePerRequestFilter {
  @Autowired Jwt jwt; @Autowired UserRepo users;
  @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
    String h = req.getHeader("Authorization");
    if (h != null && h.startsWith("Bearer ")) {
      try {
        User u = users.findByEmail(jwt.subject(h.substring(7))).orElse(null);
        if (u != null && u.status == User.Status.ACTIVE) {   // suspended/pending users are locked out immediately
          SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(u, null, List.of(new SimpleGrantedAuthority("ROLE_" + u.role))));
        }
      } catch (Exception ignored) { /* invalid or expired token -> treated as anonymous */ }
    }
    chain.doFilter(req, res);
  }
}
