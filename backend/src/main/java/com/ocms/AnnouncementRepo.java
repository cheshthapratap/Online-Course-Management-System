package com.ocms;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AnnouncementRepo extends JpaRepository<Announcement,Long> { List<Announcement> findAllByOrderByIdDesc(); }
