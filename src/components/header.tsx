import React from 'react';
import { ScanText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-card shadow-md">
      <div className="max-w-7xl mx-auto flex items-center space-x-3">
        <ScanText className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-headline font-bold text-foreground">
          CheckSnap
        </h1>
      </div>
    </header>
  );
};

export default Header;
