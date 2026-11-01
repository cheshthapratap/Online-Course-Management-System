package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UserRepo extends JpaRepository<User,Long> { Optional<User> findByEmail(String e); boolean existsByEmail(String e); long countByRole(User.Role r); }
