import React from 'react';

type FieldLimitHintProps = {
  value: string;
  maxLength: number;
  className?: string;
};

export function FieldLimitHint({ value, maxLength, className = '' }: FieldLimitHintProps) {
  return (
    <p className={`mt-1 text-xs text-gray-400 dark:text-gray-500 ${className}`.trim()}>
      {value.length}/{maxLength}
    </p>
  );
}