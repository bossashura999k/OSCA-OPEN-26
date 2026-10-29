let courses = {};
let nextId = 1;

export function createCourse(name, description = "") {
  const id = String(nextId++);
  courses[id] = { id, name, description, materials: [] };
  return courses[id];
}

export function getCourse(id) {
  return courses[id];
}

export function addMaterial(courseId, content) {
  const course = courses[courseId];
  if (!course) return null;
  course.materials.push(content);
  return course;
}

export function listCourses() {
  return Object.values(courses);
}