import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Quiz', 'Assignment', 'Practical'],
      required: [true, 'Exam type is required'],
      default: 'Final',
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      default: 100,
    },
    percentage: {
      type: Number,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
      default: 'F',
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      default: '2024-2025',
    },
    remarks: {
      type: String,
      default: '',
    },
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage and grade before saving
resultSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.totalMarks) * 100 * 10) / 10;
    
    if (this.percentage >= 90) this.grade = 'A+';
    else if (this.percentage >= 80) this.grade = 'A';
    else if (this.percentage >= 70) this.grade = 'B+';
    else if (this.percentage >= 60) this.grade = 'B';
    else if (this.percentage >= 50) this.grade = 'C';
    else if (this.percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

const Result = mongoose.model('Result', resultSchema);
export default Result;
