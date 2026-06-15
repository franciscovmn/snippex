import React from 'react';

interface TagChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tag: string;
}

const TagChip: React.FC<TagChipProps> = ({ tag, className = '', ...rest }) => {
  return (
    <button className={`tag-chip ${className}`.trim()} type="button" {...rest}>
      #{tag}
    </button>
  );
};

export default TagChip;
