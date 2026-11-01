package com.ocms;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class Announcement {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String title, author;
  @Column(length = 2000) public String message;
  public LocalDateTime createdAt = LocalDateTime.now();
}
