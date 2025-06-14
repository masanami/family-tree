import React, { memo } from 'react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const FilterSection = memo<FilterSectionProps>(({
  title,
  children,
  collapsible = false,
  collapsed = false,
  onToggle,
}) => {
  return (
    <div className="space-y-2">
      {collapsible ? (
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-150"
          aria-expanded={!collapsed}
        >
          {title}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <label className="block text-sm font-medium text-gray-700">{title}</label>
      )}
      {(!collapsible || !collapsed) && (
        <div className={`${collapsible ? 'mt-2' : ''} transition-all duration-200`}>
          {children}
        </div>
      )}
    </div>
  );
});

FilterSection.displayName = 'FilterSection';