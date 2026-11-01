package com.ocms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import static com.ocms.ApiErrors.err;
@RestController @RequestMapping("/api/student")
public class StudentController {
  @Autowired CourseRepo courses; @Autowired EnrollmentRepo enr; @Autowired LessonRepo lessons; @Autowired QuizTestRepo tests;
  @Autowired QuestionRepo questions; @Autowired AttemptRepo attempts;

  @PostMapping("/enroll/{courseId}")
  Map<String, String> enroll(@PathVariable Long courseId, @AuthenticationPrincipal User u) {
    Course c = courses.findById(courseId).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Course not found"));
    if (!c.published) throw err(HttpStatus.NOT_FOUND, "Course not found");
    if (enr.existsByStudentIdAndCourseId(u.id, courseId)) throw err(HttpStatus.CONFLICT, "Already enrolled");
    Enrollment e = new Enrollment(); e.student = u; e.course = c; enr.save(e);
    return Map.of("message", "Enrolled");
  }
  @GetMapping("/enrollments")
  List<Map<String, Object>> mine(@AuthenticationPrincipal User u) {
    return enr.findByStudentId(u.id).stream().map(e -> Map.<String, Object>of("course", e.course, "progress", e.progress(lessons.countByCourseId(e.course.id)))).toList();
  }
  @PostMapping("/complete/{courseId}/{lessonId}")
  Map<String, Object> complete(@PathVariable Long courseId, @PathVariable Long lessonId, @AuthenticationPrincipal User u) {
    Enrollment e = enr.findByStudentIdAndCourseId(u.id, courseId).orElseThrow(() -> err(HttpStatus.FORBIDDEN, "Not enrolled"));
    Lesson l = lessons.findById(lessonId).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Lesson not found"));
    if (!l.courseId.equals(courseId)) throw err(HttpStatus.BAD_REQUEST, "Lesson does not belong to this course");
    e.completed.add(lessonId); enr.save(e);
    return Map.of("progress", e.progress(lessons.countByCourseId(courseId)), "completed", e.completed);
  }
  QuizTest accessible(Long tid, User u) {
    QuizTest t = tests.findById(tid).orElseThrow(() -> err(HttpStatus.NOT_FOUND, "Test not found"));
    if (!enr.existsByStudentIdAndCourseId(u.id, t.courseId)) throw err(HttpStatus.FORBIDDEN, "Enroll in the course to take this test");
    return t;
  }
  /** Questions are sent WITHOUT the correct answer or explanation. */
  @GetMapping("/tests/{tid}")
  Map<String, Object> test(@PathVariable Long tid, @AuthenticationPrincipal User u) {
    QuizTest t = accessible(tid, u);
    List<Map<String, Object>> qs = questions.findByTestId(tid).stream().map(q -> {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("id", q.id); m.put("questionText", q.questionText); m.put("optA", q.optA); m.put("optB", q.optB);
      m.put("optC", q.optC); m.put("optD", q.optD); m.put("marks", q.marks); return m; }).toList();
    return Map.of("test", t, "questions", qs);
  }
  @PostMapping("/tests/{tid}/submit")
  Map<String, Object> submit(@PathVariable Long tid, @AuthenticationPrincipal User u, @RequestBody Map<String, String> answers) {
    QuizTest t = accessible(tid, u);
    double score = 0, total = 0; List<Map<String, Object>> review = new ArrayList<>();
    for (Question q : questions.findByTestId(tid)) {
      total += q.marks;
      String given = answers.get(String.valueOf(q.id)); boolean answered = given != null && !given.isBlank();
      boolean right = answered && q.correct.equalsIgnoreCase(given);
      if (answered) score += right ? q.marks : -t.negativeMarks;
      Map<String, Object> r = new LinkedHashMap<>();
      r.put("questionText", q.questionText); r.put("yours", answered ? given : "-"); r.put("correct", q.correct);
      r.put("right", right); r.put("explanation", q.explanation); review.add(r);
    }
    score = Math.max(0, score);
    Attempt a = new Attempt(); a.testId = tid; a.testTitle = t.title; a.student = u; a.score = score; a.total = total; a.passed = score >= t.passMarks;
    attempts.save(a);
    return Map.of("score", score, "total", total, "percentage", total == 0 ? 0 : Math.round(score * 1000 / total) / 10.0, "passed", a.passed, "review", review);
  }
  @GetMapping("/attempts") List<Attempt> history(@AuthenticationPrincipal User u) { return attempts.findByStudentIdOrderByIdDesc(u.id); }
}
