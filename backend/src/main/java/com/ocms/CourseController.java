package com.ocms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.ocms.ApiErrors.err;
@RestController @RequestMapping("/api")
public class CourseController {
  @Autowired CourseRepo courses; @Autowired EnrollmentRepo enr; @Autowired LessonRepo lessons; @Autowired QuizTestRepo tests;
  @Autowired AnnouncementRepo announcements;

  @GetMapping("/courses")
  List<Course> list(@RequestParam(required = false) String q) {
    String s = q == null ? "" : q.toLowerCase();
    return courses.findByPublishedTrue().stream().filter(c -> ((c.title + " " + c.category + " " + (c.teacher == null ? "" : c.teacher.name)).toLowerCase()).contains(s)).toList();
  }
  @GetMapping("/courses/{id}")
  Course one(@PathVariable Long id) {
    Course c = courses.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found"));
    if (!c.published) throw err(HttpStatus.NOT_FOUND, "Course not found");
    return c;
  }
  /** Lessons + tests: only for enrolled students, the owning teacher, or an admin. */
  @GetMapping("/courses/{id}/content")
  Map<String, Object> content(@PathVariable Long id, @AuthenticationPrincipal User u) {
    Course c = courses.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found"));
    boolean ok = u.role == User.Role.ADMIN
      || (u.role == User.Role.TEACHER && c.teacher != null && c.teacher.id.equals(u.id))
      || (u.role == User.Role.STUDENT && enr.existsByStudentIdAndCourseId(u.id, id));
    if (!ok) throw err(HttpStatus.FORBIDDEN, "Enroll in this course to open its content");
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("course", c);
    m.put("lessons", lessons.findByCourseIdOrderByIdAsc(id));
    m.put("tests", tests.findByCourseId(id));
    m.put("completed", u.role == User.Role.STUDENT ? enr.findByStudentIdAndCourseId(u.id, id).map(e -> e.completed).orElse(Set.of()) : Set.of());
    return m;
  }
  @GetMapping("/announcements") List<Announcement> news() { return announcements.findAllByOrderByIdDesc(); }
  @PostMapping("/announcements")
  Announcement post(@RequestBody Announcement in, @AuthenticationPrincipal User u) {
    if (u.role == User.Role.STUDENT) throw err(HttpStatus.FORBIDDEN, "Only teachers and admins can post announcements");
    if (in.title == null || in.title.isBlank() || in.message == null || in.message.isBlank()) throw err(HttpStatus.BAD_REQUEST, "Title and message are required");
    in.id = null; in.author = u.name; in.createdAt = java.time.LocalDateTime.now();
    return announcements.save(in);
  }
}
