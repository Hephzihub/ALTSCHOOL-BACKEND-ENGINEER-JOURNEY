// import student data json file
import students from '../data/students.json' with { type: 'json' };

// Controller functions for student operations

export const getAllStudents = (req, res) => {
  // filter students based on query parameters if provided
  const { name, age, gender } = req.query;
  let filteredStudents = students;
  if (name) {
    filteredStudents = filteredStudents.filter(student => student.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (age) {
    filteredStudents = filteredStudents.filter(student => student.age === parseInt(age));
  }
  if (gender) {
    filteredStudents = filteredStudents.filter(student => student.gender.toLowerCase() === gender.toLowerCase());
  }
  res.json({
    message: 'List of all students',
    data: filteredStudents,
    total: filteredStudents.length
  });
};

export const createStudent = (req, res) => {
  res.json({
    message: 'Student created successfully',
    data: req.body
  });
};

export const getStudentById = (req, res) => {
  const { id } = req.params;
  // Find student by ID
  const student = students.find(s => s.id === parseInt(id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json({
    message: `Details of student with ID: ${id}`,
    data: student
  })
};

export const updateStudent = (req, res) => {
  const { id } = req.params;
  res.send(`Update student with ID: ${id}`);
};

export const deleteStudent = (req, res) => {
  const { id } = req.params;
  res.send(`Delete student with ID: ${id}`);
};
