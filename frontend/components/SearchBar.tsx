"use client";

import React from "react";

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-md mx-auto">
        {/* 🔍 Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* 🔤 Search Input */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search by name, tracking ID, room, block, or courier..."
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* ❌ Clear Button */}
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
