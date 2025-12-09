import React from 'react';
import { useA11y } from '../contexts/AccessibilityContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  label: string; // Required for accessibility
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  label, 
  icon, 
  children, 
  className = '', 
  ...props 
}) => {
  const { highContrast, fontSize } = useA11y();

  let baseStyles = "transition-transform active:scale-95 rounded-xl font-bold flex items-center justify-center gap-2 outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 ";
  
  // Adjust padding based on font size preference
  const padding = fontSize === 'extra-large' ? 'px-8 py-6' : 'px-6 py-4';
  
  let colorStyles = "";

  if (highContrast) {
    colorStyles = "border-2 border-yellow-300 bg-black text-yellow-300 hover:bg-yellow-900";
    if (variant === 'primary') colorStyles = "bg-yellow-300 text-black border-2 border-yellow-300 hover:bg-yellow-400";
  } else {
    switch (variant) {
      case 'primary':
        colorStyles = "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg";
        break;
      case 'secondary':
        colorStyles = "bg-white text-indigo-900 border-2 border-indigo-100 hover:border-indigo-300 shadow-sm";
        break;
      case 'danger':
        colorStyles = "bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-200";
        break;
      case 'icon':
        colorStyles = "p-3 bg-transparent hover:bg-gray-100 text-gray-700";
        break;
    }
  }

  // Override padding for icon variant
  const finalPadding = variant === 'icon' ? 'p-4' : padding;

  return (
    <button 
      className={`${baseStyles} ${finalPadding} ${colorStyles} ${className}`}
      aria-label={label}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};