package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface QuizTestRepo extends JpaRepository<QuizTest,Long> { List<QuizTest> findByCourseId(Long c); }
