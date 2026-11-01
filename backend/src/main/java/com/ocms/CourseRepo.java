package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CourseRepo extends JpaRepository<Course,Long> { List<Course> findByPublishedTrue(); List<Course> findByTeacherId(Long id); }
