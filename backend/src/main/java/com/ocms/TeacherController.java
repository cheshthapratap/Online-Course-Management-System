package com.ocms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.ocms.ApiErrors.err;
@RestController @RequestMapping("/api/teacher")
public class TeacherController {
  @Autowired CourseRepo courses; @Autowired LessonRepo lessons; @Autowired QuizTestRepo tests; @Autowired QuestionRepo questions;
  @Autowired AttemptRepo attempts; @Autowired EnrollmentRepo enr;

  Course own(Long id, User u) {
    Course c = courses.findById(id).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found"));
    if (c.teacher == null || !c.teacher.id.equals(u.id)) throw err(HttpStatus.FORBIDDEN, "This is not your course");
    return c;
  }
  @GetMapping("/courses") List<Course> mine(@AuthenticationPrincipal User u) { return courses.findByTeacherId(u.id); }
  @PostMapping("/courses")
  Course create(@AuthenticationPrincipal User u, @RequestBody Course in) {
    if (in.title == null || in.title.isBlank()) throw err(HttpStatus.BAD_REQUEST, "Course title is required");
    in.id = null; in.teacher = u; in.published = false;   // admin publishes
    return courses.save(in);
  }
  @PutMapping("/courses/{id}")
  Course update(@PathVariable Long id, @AuthenticationPrincipal User u, @RequestBody Course in) {
    Course c = own(id, u); c.title = in.title; c.description = in.description; c.category = in.category; c.duration = in.duration; c.fee = in.fee;
    return courses.save(c);
  }
  @PostMapping("/courses/{id}/lessons")
  Lesson addLesson(@PathVariable Long id, @AuthenticationPrincipal User u, @RequestBody Lesson in) {
    own(id, u);
    if (in.title == null || in.title.isBlank()) throw err(HttpStatus.BAD_REQUEST, "Lesson title is required");
    in.id = null; in.courseId = id; return lessons.save(in);
  }
  @DeleteMapping("/lessons/{lid}")
  void delLesson(@PathVariable Long lid, @AuthenticationPrincipal User u) {
    Lesson l = lessons.findById(lid).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Lesson not found"));
    own(l.courseId, u); lessons.delete(l);
  }
  @PostMapping("/courses/{id}/tests")
  QuizTest addTest(@PathVariable Long id, @AuthenticationPrincipal User u, @RequestBody QuizTest in) {
    own(id, u);
    if (in.title == null || in.title.isBlank()) throw err(HttpStatus.BAD_REQUEST, "Test title is required");
    in.id = null; in.courseId = id; return tests.save(in);
  }
  QuizTest ownTest(Long tid, User u) {
    QuizTest t = tests.findById(tid).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Test not found"));
    own(t.courseId, u); return t;
  }
  @PostMapping("/tests/{tid}/questions")
  Question addQuestion(@PathVariable Long tid, @AuthenticationPrincipal User u, @RequestBody Question in) {
    ownTest(tid, u);
    if (in.questionText == null || in.questionText.isBlank() || in.optA == null || in.optB == null || in.optC == null || in.optD == null)
      throw err(HttpStatus.BAD_REQUEST, "Question text and all four options are required");
    if (in.correct == null || !in.correct.matches("[A-D]")) throw err(HttpStatus.BAD_REQUEST, "Correct answer must be A, B, C or D");
    in.id = null; in.testId = tid; return questions.save(in);
  }
  @GetMapping("/tests/{tid}/questions") List<Question> qs(@PathVariable Long tid, @AuthenticationPrincipal User u) { ownTest(tid, u); return questions.findByTestId(tid); }
  @GetMapping("/tests/{tid}/results") List<Attempt> results(@PathVariable Long tid, @AuthenticationPrincipal User u) { ownTest(tid, u); return attempts.findByTestId(tid); }
  @GetMapping("/courses/{id}/students")
  List<Map<String, Object>> students(@PathVariable Long id, @AuthenticationPrincipal User u) {
    own(id, u); long n = lessons.countByCourseId(id);
    return enr.findByCourseId(id).stream().map(e -> Map.<String, Object>of("name", e.student.name, "email", e.student.email, "progress", e.progress(n))).toList();
  }
}
