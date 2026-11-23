import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Course from './models/Course.js';
import Attendance from './models/Attendance.js';
import Result from './models/Result.js';
import Notice from './models/Notice.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('Seeding initial academic records...');

    // 1. Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@sms.com',
      password: 'admin123',
      role: 'admin',
    });

    // 2. Teachers
    const teacher1User = await User.create({
      name: 'Dr. Alan Turing',
      email: 'teacher@sms.com',
      password: 'teacher123',
      role: 'teacher',
    });
    const teacher1 = await Teacher.create({
      user: teacher1User._id,
      teacherId: 'TCH-1001',
      firstName: 'Alan',
      lastName: 'Turing',
      email: teacher1User.email,
      phone: '+1 555-0101',
      department: 'Computer Science',
      designation: 'Professor & HOD',
      qualification: 'Ph.D. in Computer Science',
      status: 'Active',
    });

    const teacher2User = await User.create({
      name: 'Prof. Ada Lovelace',
      email: 'ada.faculty@sms.com',
      password: 'teacher123',
      role: 'teacher',
    });
    const teacher2 = await Teacher.create({
      user: teacher2User._id,
      teacherId: 'TCH-1002',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: teacher2User.email,
      phone: '+1 555-0102',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'M.Tech, Ph.D.',
      status: 'Active',
    });

    const teacher3User = await User.create({
      name: 'Dr. Nikola Tesla',
      email: 'tesla.faculty@sms.com',
      password: 'teacher123',
      role: 'teacher',
    });
    const teacher3 = await Teacher.create({
      user: teacher3User._id,
      teacherId: 'TCH-1003',
      firstName: 'Nikola',
      lastName: 'Tesla',
      email: teacher3User.email,
      phone: '+1 555-0103',
      department: 'Electrical Engineering',
      designation: 'Senior Professor',
      qualification: 'D.Sc. Electrical Science',
      status: 'Active',
    });

    // 3. Courses
    const course1 = await Course.create({
      courseCode: 'CS101',
      courseName: 'Data Structures & Algorithms',
      department: 'Computer Science',
      semester: 3,
      credits: 4,
      description: 'Fundamental data structures, stacks, queues, trees, graphs and algorithm analysis.',
      teacher: teacher1._id,
      maxCapacity: 60,
    });

    const course2 = await Course.create({
      courseCode: 'CS202',
      courseName: 'Database Management Systems',
      department: 'Computer Science',
      semester: 4,
      credits: 4,
      description: 'Relational algebra, SQL, indexing, transaction processing and NoSQL databases.',
      teacher: teacher2._id,
      maxCapacity: 50,
    });

    const course3 = await Course.create({
      courseCode: 'CS303',
      courseName: 'Full Stack Web Engineering',
      department: 'Computer Science',
      semester: 5,
      credits: 3,
      description: 'Modern full stack web development using React, Node, Express and MongoDB.',
      teacher: teacher1._id,
      maxCapacity: 45,
    });

    const course4 = await Course.create({
      courseCode: 'EE201',
      courseName: 'Digital Signal Processing',
      department: 'Electrical Engineering',
      semester: 4,
      credits: 4,
      description: 'Discrete-time signals, Fourier analysis, Z-transform and filter design.',
      teacher: teacher3._id,
      maxCapacity: 40,
    });

    const course5 = await Course.create({
      courseCode: 'IT105',
      courseName: 'Computer Networks & Security',
      department: 'Information Technology',
      semester: 3,
      credits: 3,
      description: 'OSI model, TCP/IP protocols, routing, firewalls, and cryptographic protocols.',
      teacher: teacher2._id,
      maxCapacity: 55,
    });

    // Link assigned courses to teachers
    await Teacher.findByIdAndUpdate(teacher1._id, {
      $set: { assignedCourses: [course1._id, course3._id] },
    });
    await Teacher.findByIdAndUpdate(teacher2._id, {
      $set: { assignedCourses: [course2._id, course5._id] },
    });
    await Teacher.findByIdAndUpdate(teacher3._id, {
      $set: { assignedCourses: [course4._id] },
    });

    // 4. Students
    const student1User = await User.create({
      name: 'Alex Johnson',
      email: 'student@sms.com',
      password: 'student123',
      role: 'student',
    });
    const student1 = await Student.create({
      user: student1User._id,
      rollNumber: 'STU-1001',
      admissionNumber: 'ADM-2024-001',
      firstName: 'Alex',
      lastName: 'Johnson',
      email: student1User.email,
      phone: '+1 555-0201',
      gender: 'Male',
      dateOfBirth: new Date('2004-05-14'),
      department: 'Computer Science',
      semester: 4,
      academicYear: '2023-2027',
      coursesEnrolled: [course1._id, course2._id, course3._id],
      address: {
        street: '42 Campus Way',
        city: 'Boston',
        state: 'MA',
        zipCode: '02115',
      },
      guardian: {
        name: 'Robert Johnson',
        relationship: 'Father',
        phone: '+1 555-0299',
        email: 'robert.j@example.com',
      },
      status: 'Active',
    });

    const student2User = await User.create({
      name: 'Emma Watson',
      email: 'emma.student@sms.com',
      password: 'student123',
      role: 'student',
    });
    const student2 = await Student.create({
      user: student2User._id,
      rollNumber: 'STU-1002',
      admissionNumber: 'ADM-2024-002',
      firstName: 'Emma',
      lastName: 'Watson',
      email: student2User.email,
      phone: '+1 555-0202',
      gender: 'Female',
      dateOfBirth: new Date('2004-08-22'),
      department: 'Computer Science',
      semester: 4,
      academicYear: '2023-2027',
      coursesEnrolled: [course1._id, course2._id, course3._id],
      address: {
        street: '18 Oak Boulevard',
        city: 'Cambridge',
        state: 'MA',
        zipCode: '02138',
      },
      guardian: {
        name: 'Helen Watson',
        relationship: 'Mother',
        phone: '+1 555-0298',
        email: 'helen.w@example.com',
      },
      status: 'Active',
    });

    const student3User = await User.create({
      name: 'David Miller',
      email: 'david.student@sms.com',
      password: 'student123',
      role: 'student',
    });
    const student3 = await Student.create({
      user: student3User._id,
      rollNumber: 'STU-1003',
      admissionNumber: 'ADM-2024-003',
      firstName: 'David',
      lastName: 'Miller',
      email: student3User.email,
      phone: '+1 555-0203',
      gender: 'Male',
      dateOfBirth: new Date('2003-11-09'),
      department: 'Electrical Engineering',
      semester: 4,
      academicYear: '2023-2027',
      coursesEnrolled: [course4._id],
      status: 'Active',
    });

    // 5. Attendance Records
    const attendanceRecords = [];
    const pastDays = [1, 2, 3, 4, 5, 6, 7];

    pastDays.forEach((dayOffset) => {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);

      attendanceRecords.push(
        {
          course: course1._id,
          student: student1._id,
          teacher: teacher1._id,
          date,
          status: dayOffset === 3 ? 'Absent' : dayOffset === 5 ? 'Late' : 'Present',
          remarks: dayOffset === 3 ? 'Sick leave request submitted' : '',
        },
        {
          course: course1._id,
          student: student2._id,
          teacher: teacher1._id,
          date,
          status: 'Present',
          remarks: '',
        },
        {
          course: course2._id,
          student: student1._id,
          teacher: teacher2._id,
          date,
          status: 'Present',
          remarks: '',
        }
      );
    });

    await Attendance.insertMany(attendanceRecords);

    // 6. Examination Results
    const resultsData = [
      {
        student: student1._id,
        course: course1._id,
        examType: 'Midterm',
        marksObtained: 88,
        totalMarks: 100,
        semester: 4,
        remarks: 'Excellent problem solving ability',
        declaredBy: teacher1User._id,
      },
      {
        student: student1._id,
        course: course2._id,
        examType: 'Midterm',
        marksObtained: 92,
        totalMarks: 100,
        semester: 4,
        remarks: 'Outstanding database schema design',
        declaredBy: teacher2User._id,
      },
      {
        student: student1._id,
        course: course3._id,
        examType: 'Assignment',
        marksObtained: 95,
        totalMarks: 100,
        semester: 4,
        remarks: 'Top rated MERN stack project delivery',
        declaredBy: teacher1User._id,
      },
      {
        student: student2._id,
        course: course1._id,
        examType: 'Midterm',
        marksObtained: 94,
        totalMarks: 100,
        semester: 4,
        remarks: 'Great depth of algorithmic concepts',
        declaredBy: teacher1User._id,
      },
    ];

    for (const r of resultsData) {
      const resDoc = new Result(r);
      await resDoc.save();
    }

    // 7. Notices
    await Notice.create([
      {
        title: 'Mid-Semester Examination Schedule Announced',
        content:
          'The Spring 2026 Mid-Semester Examinations are scheduled to commence from December 5th. All students must download their hall tickets from the student portal and bring a valid student ID card to the exam hall.',
        category: 'Examination',
        targetAudience: 'All',
        priority: 'High',
        isPinned: true,
        author: adminUser._id,
      },
      {
        title: 'Annual Technical Symposium: HackTech 2026',
        content:
          'Registration is now open for HackTech 2026! 36-hour hackathon with cash prizes over $10,000, mentor sessions with industry experts, and internship opportunities for finalists. Register your team of 3-4 members.',
        category: 'Event',
        targetAudience: 'Student',
        priority: 'Medium',
        isPinned: true,
        author: teacher1User._id,
      },
      {
        title: 'Faculty Academic Council Meeting',
        content:
          'All department heads and teaching faculty are requested to attend the quarterly Academic Council Meeting this Friday at 3:00 PM in Conference Hall B to review syllabus milestones and student performance metrics.',
        category: 'Academic',
        targetAudience: 'Teacher',
        priority: 'High',
        isPinned: false,
        author: adminUser._id,
      },
    ]);

    console.log('[Initial data seed completed successfully]');
    console.log('Credentials: admin@sms.com / admin123 | teacher@sms.com / teacher123 | student@sms.com / student123');
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
  }
};

export const autoSeedIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await seedDatabase();
  }
};

if (process.argv[1]?.endsWith('seeder.js')) {
  import('./config/db.js').then(async (m) => {
    await m.default();
    await seedDatabase();
    process.exit(0);
  });
}
