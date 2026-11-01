package com.ocms;
import jakarta.persistence.*;
import java.util.*;
@Entity
public class Enrollment {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  @ManyToOne public User student;
  @ManyToOne public Course course;
  @ElementCollection(fetch = FetchType.EAGER) public Set<Long> completed = new HashSet<>();
  public int progress(long totalLessons) { return totalLessons == 0 ? 0 : (int) Math.min(100, completed.size() * 100L / totalLessons); }
}
