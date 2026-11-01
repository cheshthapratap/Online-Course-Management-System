package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface EnrollmentRepo extends JpaRepository<Enrollment,Long> { List<Enrollment> findByStudentId(Long id); List<Enrollment> findByCourseId(Long id); boolean existsByStudentIdAndCourseId(Long s, Long c); Optional<Enrollment> findByStudentIdAndCourseId(Long s, Long c); }
