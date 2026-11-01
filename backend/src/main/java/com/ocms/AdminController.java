package com.ocms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.ocms.ApiErrors.err;
@RestController @RequestMapping("/api/admin")
public class AdminController {
  @Autowired UserRepo users; @Autowired CourseRepo courses; @Autowired EnrollmentRepo enr; @Autowired LessonRepo lessons;
  @Autowired QuizTestRepo tests; @Autowired QuestionRepo questions; @Autowired AttemptRepo attempts;

  @GetMapping("/stats")
  Map<String, Object> stats() {
    return Map.of("students", users.countByRole(User.Role.STUDENT), "teachers", users.countByRole(User.Role.TEACHER),
      "courses", courses.count(), "enrollments", enr.count(),
      "pendingTeachers", users.findAll().stream().filter(x -> x.status == User.Status.PENDING).count());
  }
  @GetMapping("/users") List<User> allUsers() { return users.findAll(); }
  @PutMapping("/users/{id}/status")
  User setStatus(@PathVariable Long id, @RequestParam User.Status value) {
    User u = users.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "User not found"));
    if (u.role == User.Role.ADMIN) throw err(HttpStatus.BAD_REQUEST, "Admin accounts cannot be changed here");
    u.status = value; return users.save(u);
  }
  @GetMapping("/courses") List<Course> allCourses() { return courses.findAll(); }
  @PutMapping("/courses/{id}/publish")
  Course publish(@PathVariable Long id, @RequestParam boolean value) {
    Course c = courses.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found")); c.published = value; return courses.save(c);
  }
  @PutMapping("/courses/{id}/teacher/{tid}")
  Course assign(@PathVariable Long id, @PathVariable Long tid) {
    Course c = courses.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found"));
    User t = users.findById(tid).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Teacher not found"));
    if (t.role != User.Role.TEACHER || t.status != User.Status.ACTIVE) throw err(HttpStatus.BAD_REQUEST, "Pick an active teacher");
    c.teacher = t; return courses.save(c);
  }
  @DeleteMapping("/courses/{id}") @Transactional
  void deleteCourse(@PathVariable Long id) {
    enr.deleteAll(enr.findByCourseId(id)); lessons.deleteAll(lessons.findByCourseIdOrderByIdAsc(id));
    for (QuizTest t : tests.findByCourseId(id)) { questions.deleteAll(questions.findByTestId(t.id)); attempts.deleteAll(attempts.findByTestId(t.id)); tests.delete(t); }
    courses.deleteById(id);
  }
  @GetMapping("/results") List<Attempt> results() { return attempts.findAll(); }
}
