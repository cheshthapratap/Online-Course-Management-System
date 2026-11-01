package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface QuestionRepo extends JpaRepository<Question,Long> { List<Question> findByTestId(Long t); }
