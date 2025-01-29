// import React from 'react';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';

const StudentProgress = () => {
  const students = [
    {
      name: 'Emma Watson',
      level: 'Advanced',
      attendance: 95,
      lastAssessment: 92,
      improvements: ['Speaking fluency', 'Business vocabulary'],
      achievements: ['Completed B2 certification', 'Perfect attendance'],
      goals: ['C1 certification', 'Business presentation skills']
    },
    {
      name: 'John Smith',
      level: 'Intermediate',
      attendance: 85,
      lastAssessment: 78,
      improvements: ['Grammar accuracy', 'Listening comprehension'],
      achievements: ['Completed B1 certification'],
      goals: ['B2 certification', 'Conversational fluency']
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Progress</h2>
      
      <div className="space-y-6">
        {students.map((student, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.level}</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-gray-600">Attendance:</span>
                  <span className={`ml-2 font-medium ${
                    student.attendance >= 90 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {student.attendance}%
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Last Assessment:</span>
                  <span className={`ml-2 font-medium ${
                    student.lastAssessment >= 90 ? 'text-green-600' : 
                    student.lastAssessment >= 75 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {student.lastAssessment}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {student.improvements.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-6">• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Achievements
                </h4>
                <ul className="space-y-1">
                  {student.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-6">• {achievement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Learning Goals
                </h4>
                <ul className="space-y-1">
                  {student.goals.map((goal, i) => (
                    <li key={i} className="text-sm text-gray-600 pl-6">• {goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProgress;