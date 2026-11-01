package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface LessonRepo extends JpaRepository<Lesson,Long> { List<Lesson> findByCourseIdOrderByIdAsc(Long c); long countByCourseId(Long c); }
