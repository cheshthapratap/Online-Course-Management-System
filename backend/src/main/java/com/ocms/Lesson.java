package com.ocms;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class Lesson {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public Long courseId;
  public String title, chapter, videoUrl, fileUrl, liveLink;
  @Column(length = 4000) public String notes;
  public LocalDateTime liveTime;
}
