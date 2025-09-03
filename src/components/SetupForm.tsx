import React from 'react';
import { Subject } from '../types/schedule';
import DataUploader from './DataUploader';

interface SetupFormProps {
  onSubmit: (subjects: Subject[]) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSubmit }) => {
  return (
    <DataUploader onDataSubmit={onSubmit} />
  );
};