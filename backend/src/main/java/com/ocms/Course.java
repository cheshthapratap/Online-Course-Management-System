package com.ocms;
import jakarta.persistence.*;
@Entity
public class Course {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String title, category, duration;
  public Double fee;
  @Column(length = 2000) public String description;
  @ManyToOne public User teacher;
  public boolean published;
}
