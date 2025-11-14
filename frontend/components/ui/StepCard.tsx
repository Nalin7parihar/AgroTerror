import React from 'react';
import { Card } from './Card';

interface StepCardProps {
  number: number;
  icon?: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export function StepCard({
  number,
  icon,
  title,
  description,
  onClick,
  className = '',
}: StepCardProps) {
  return (
    <Card
      hover={!!onClick}
      className={`relative cursor-pointer ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {number}
          </div>
        </div>
        <div className="flex-1">
          {icon && (
            <div className="mb-2 text-primary">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
          <p className="text-text/70 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}

