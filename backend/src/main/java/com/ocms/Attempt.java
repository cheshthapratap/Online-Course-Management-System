package com.ocms;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class Attempt {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long testId;
  public String testTitle;
  @ManyToOne public User student;
  public double score, total;
  public boolean passed;
  public LocalDateTime submittedAt = LocalDateTime.now();
}
