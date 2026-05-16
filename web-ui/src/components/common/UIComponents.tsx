import React from 'react';
import { COLORS } from '../../constants/theme';

interface SectionBadgeProps {
  label: string;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ label }) => {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
      <span style={{ color: COLORS.yellow, fontSize: 13 }}>(</span>
      <span style={{ color: COLORS.muted, fontSize: 13 }}>{label}</span>
      <span style={{ color: COLORS.yellow, fontSize: 13 }}>)</span>
    </div>
  );
};

export const SpinIcon: React.FC = () => {
  return (
    <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>✦</span>
  );
};
