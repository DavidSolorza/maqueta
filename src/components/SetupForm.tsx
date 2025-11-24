import React from 'react';
import { Subject } from '../types/schedule';
import DataUploader from './DataUploader';

interface SetupFormProps {
  onSubmit: (subjects: Subject[], targetCount?: number) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSubmit }) => {
  return (
    <div className="min-h-screen">
      <DataUploader onDataSubmit={onSubmit} />
    </div>
  );
};
