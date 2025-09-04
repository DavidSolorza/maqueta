import React from 'react';
import { Subject } from '../types/schedule';
import { DataUploader } from './DataUploader';

interface SetupFormProps {
  onSubmit: (subjects: Subject[], targetCount?: number) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSubmit }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DataUploader onDataSubmit={onSubmit} />
    </div>
  );
};