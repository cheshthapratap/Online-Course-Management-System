package com.ocms;
import jakarta.persistence.*;
@Entity
public class QuizTest {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long courseId;
  public String title;
  public int durationMinutes = 10;
  public double passMarks, negativeMarks;
}
