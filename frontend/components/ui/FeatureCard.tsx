import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  cta,
  onCtaClick,
  className = '',
}: FeatureCardProps) {
  return (
    <Card hover className={`h-full flex flex-col ${className}`}>
      <div className="mb-4 text-primary text-4xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-text/70 text-sm leading-relaxed flex-1 mb-4">{description}</p>
      {cta && (
        <Button
          variant="primary"
          size="sm"
          onClick={onCtaClick}
          className="w-full"
        >
          {cta}
        </Button>
      )}
    </Card>
  );
}

