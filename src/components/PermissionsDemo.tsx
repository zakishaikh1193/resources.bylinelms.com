import React, { useState } from 'react';
import { Shield, Users, BookOpen, GraduationCap } from 'lucide-react';

interface DemoProps {
  onStartDemo: () => void;
}

const PermissionsDemo: React.FC<DemoProps> = ({ onStartDemo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "School Permissions System",
      description: "Control which resources each school can access",
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600">
            The new permissions system allows administrators to assign specific subject-grade combinations to schools.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Key Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Assign multiple subjects with different grade ranges</li>
              <li>• Visual matrix interface for easy selection</li>
              <li>• Bulk operations (Select All/Remove All)</li>
              <li>• Real-time permission enforcement</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Example: School A",
      description: "Social Science (Grades 5-12) + ICT (Grades 1-4)",
      icon: <Users className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">School A Permissions:</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm">Social Science: Grades 5, 6, 7, 8, 9, 10, 11, 12</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm">ICT: Grades 1, 2, 3, 4</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            This school can only access resources that match these subject-grade combinations.
          </p>
        </div>
      )
    },
    {
      title: "Example: School B",
      description: "Mathematics (Grades 1-8) + Science (Grades 6-12)",
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">School B Permissions:</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-sm">Mathematics: Grades 1, 2, 3, 4, 5, 6, 7, 8</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm">Science: Grades 6, 7, 8, 9, 10, 11, 12</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Each school can have completely different permission sets based on their needs.
          </p>
        </div>
      )
    },
    {
      title: "How It Works",
      description: "Step-by-step permission management",
      icon: <GraduationCap className="w-8 h-8 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
              <div>
                <h4 className="font-semibold">Navigate to School Management</h4>
                <p className="text-sm text-gray-600">Go to the "School Management" tab in the admin dashboard</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
              <div>
                <h4 className="font-semibold">Click Permissions Button</h4>
                <p className="text-sm text-gray-600">Click the purple shield icon next to any school</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
              <div>
                <h4 className="font-semibold">Select Subject-Grade Combinations</h4>
                <p className="text-sm text-gray-600">Use the matrix to select which subjects and grades the school can access</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</div>
              <div>
                <h4 className="font-semibold">Save Changes</h4>
                <p className="text-sm text-gray-600">Click "Save Permissions" to apply the changes</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStartDemo();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center mb-6">
            {currentStepData.icon}
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
          
          {currentStepData.content}
          
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Start Demo' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDemo;


