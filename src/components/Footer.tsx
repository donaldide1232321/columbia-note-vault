
import React from 'react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="mt-auto">
      <Separator className="mb-6" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>Made by Columbia students, for Columbia Students</p>
          <p>© 2025</p>
          <p>Contact us: NotesHubAtColumbia@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
