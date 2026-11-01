package com.ocms;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
@Component
public class DataSeeder implements CommandLineRunner {
  @Autowired UserRepo users; @Autowired CourseRepo courses; @Autowired LessonRepo lessons; @Autowired QuizTestRepo tests;
  @Autowired QuestionRepo questions; @Autowired PasswordEncoder enc;
  @Value("${app.admin.email}") String adminEmail; @Value("${app.admin.password}") String adminPw; @Value("${app.demo}") boolean demo;

  User mk(String n, String e, String p, User.Role r) {
    User u = new User(); u.name = n; u.email = e; u.password = enc.encode(p); u.role = r; u.status = User.Status.ACTIVE; return users.save(u);
  }
  void q(Long t, String text, String a, String b, String c, String d, String ok, String why) {
    Question x = new Question(); x.testId = t; x.questionText = text; x.optA = a; x.optB = b; x.optC = c; x.optD = d; x.correct = ok; x.explanation = why; x.marks = 2; questions.save(x);
  }
  Course course(User t, String title, String cat, String dur, double fee, String desc, String chapter, String lesson, String notes) {
    Course c = new Course(); c.title = title; c.category = cat; c.duration = dur; c.fee = fee; c.teacher = t; c.published = true; c.description = desc; c = courses.save(c);
    Lesson l = new Lesson(); l.courseId = c.id; l.chapter = chapter; l.title = lesson; l.notes = notes; lessons.save(l);
    return c;
  }
  @Override public void run(String... args) {
    if (users.countByRole(User.Role.ADMIN) == 0) mk("Administrator", adminEmail.toLowerCase(), adminPw, User.Role.ADMIN);  // first admin: set ADMIN_EMAIL / ADMIN_PASSWORD
    if (!demo) return;
    User t = users.findByEmail("teacher@ocms.com").orElseGet(() -> mk("Demo Teacher", "teacher@ocms.com", "Teacher@123", User.Role.TEACHER));
    if (!users.existsByEmail("student@ocms.com")) mk("Demo Student", "student@ocms.com", "Student@123", User.Role.STUDENT);
    if (courses.count() == 0) {
      Course c = course(t, "Java Programming Basics", "Programming", "4 weeks", 1999, "Learn Java from variables to object-oriented design with notes, a live class and chapter quizzes.",
        "Chapter 1", "Variables and data types", "Java is statically typed. Primitive types: int, long, double, boolean, char. Use String for text.");
      Lesson l2 = new Lesson(); l2.courseId = c.id; l2.chapter = "Chapter 2"; l2.title = "Live Q&A session"; l2.liveLink = "https://meet.google.com/";
      l2.liveTime = LocalDateTime.now().plusDays(2).withMinute(0).withSecond(0).withNano(0); l2.notes = "Bring your questions on Chapter 1."; lessons.save(l2);
      QuizTest qt = new QuizTest(); qt.courseId = c.id; qt.title = "Chapter 1 quiz"; qt.durationMinutes = 5; qt.passMarks = 2; qt.negativeMarks = 0.5; qt = tests.save(qt);
      q(qt.id, "Which type stores true/false?", "int", "boolean", "String", "char", "B", "boolean holds only true or false.");
      q(qt.id, "Which keyword makes a constant?", "static", "const", "final", "var", "C", "final prevents reassignment of a variable.");
    }
    if (courses.count() < 4) {
      course(t, "Class 10 Mathematics", "School Boards", "6 months", 2499, "Complete board syllabus with weekly live doubt classes, chapter notes and practice papers.", "Chapter 1", "Real numbers", "Euclid's division lemma: a = bq + r with 0 <= r < b.");
      course(t, "JEE Main Physics Crash Course", "Engineering Entrance", "3 months", 3999, "Concept revision, previous-year problems and timed mock tests for JEE Main.", "Unit 1", "Kinematics", "v = u + at; s = ut + (1/2)at^2; v^2 = u^2 + 2as.");
      course(t, "NEET Biology Foundation", "Medical Entrance", "5 months", 3499, "NCERT-based lectures, diagrams, notes and daily MCQ practice for NEET.", "Unit 1", "The living world", "Taxonomic hierarchy: species, genus, family, order, class, phylum, kingdom.");
      course(t, "Spoken English and Communication", "Language", "8 weeks", 1499, "Build fluency and confidence with live speaking practice and recorded grammar lessons.", "Week 1", "Everyday conversation", "Practise greetings, introductions and small talk aloud for ten minutes daily.");
      course(t, "Python for Beginners", "Programming", "6 weeks", 999, "Start coding from zero: variables, loops, functions and small projects.", "Chapter 1", "Your first program", "print('Hello') displays text. Variables store values: age = 18.");
    }
  }
}
