package com.ocms;
import jakarta.persistence.*;
@Entity
public class Question {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long testId;
  @Column(length = 1000) public String questionText, explanation;
  public String optA, optB, optC, optD, correct;
  public double marks = 1;
}
