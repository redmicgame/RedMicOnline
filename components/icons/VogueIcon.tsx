import React from 'react';

const VogueIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20" className={className} fill="currentColor">
        <path d="M0 0 H 12 V 15 L 6 20 L 0 15 V 0 Z M 15 0 H 27 V 20 H 15 V 0 Z M 30 0 C 40 0 40 20 30 20 H 28 V 0 H 30 Z M 45 0 H 57 V 20 H 45 V 0 Z M 60 0 H 72 L 66 10 L 60 0 Z M 60 10 H 72 L 66 20 L 60 10 Z M 75 0 H 87 V 20 H 75 V 0 Z M 80 8 H 82 V 12 H 80 Z"/>
    </svg>
);

export default VogueIcon;
