package com.ocms;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
@Entity @Table(name = "users")
public class User {
  public enum Role { ADMIN, TEACHER, STUDENT }
  public enum Status { ACTIVE, PENDING, SUSPENDED }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String name;
  @Column(unique = true) public String email;
  @JsonIgnore public String password;
  @Enumerated(EnumType.STRING) public Role role;
  @Enumerated(EnumType.STRING) public Status status;
  public String mobile, city, qualification, guardianName, guardianMobile;
}
