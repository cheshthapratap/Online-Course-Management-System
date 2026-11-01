package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AttemptRepo extends JpaRepository<Attempt,Long> { List<Attempt> findByStudentIdOrderByIdDesc(Long s); List<Attempt> findByTestId(Long t); }
