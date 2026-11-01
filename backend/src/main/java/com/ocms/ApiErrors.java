package com.ocms;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
@RestControllerAdvice
public class ApiErrors {
  public static ResponseStatusException err(HttpStatus s, String m) { return new ResponseStatusException(s, m); }
  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<Map<String, String>> rse(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "Error" : e.getReason()));
  }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
    var f = e.getBindingResult().getFieldError();
    return ResponseEntity.badRequest().body(Map.of("message", f == null ? "Invalid input" : f.getField() + ": " + f.getDefaultMessage()));
  }
}
