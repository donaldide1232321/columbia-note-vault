
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { search, upload, user } from 'lucide-react';

interface Upload {
  id: string;
  userId: string;
  username: string;
  course: string;
  professor: string;
  fileType: string;
  label: string;
  fileName: string;
  uploadDate: string;
  upvotes: number;
  downvotes: number;
}

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  const departments = [
    'COMS', 'ECON', 'MATH', 'PHYS', 'CHEM', 'BIOL', 'ENGL', 'HIST', 'PSYC', 'STAT'
  ];

  useEffect(() => {
    // Redirect if user hasn't uploaded
    if (!user?.hasUploaded) {
      toast({ 
        title: "Upload required", 
        description: "Please upload some materials before browsing", 
        variant: "destructive" 
      });
      navigate('/upload');
      return;
    }

    const savedUploads = JSON.parse(localStorage.getItem('noteshub_uploads') || '[]');
    const savedVotes = JSON.parse(localStorage.getItem(`noteshub_votes_${user?.id}`) || '{}');
    setUploads(savedUploads);
    setFilteredUploads(savedUploads);
    setUserVotes(savedVotes);
  }, [user, navigate]);

  useEffect(() => {
    let filtered = uploads;

    if (selectedDepartment) {
      filtered = filtered.filter(upload => 
        upload.course.startsWith(selectedDepartment)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(upload =>
        upload.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUploads(filtered);
  }, [uploads, selectedDepartment, searchTerm]);

  const handleVote = (uploadId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[uploadId];
    let newVotes = { ...userVotes };
    
    // Update uploads array
    const updatedUploads = uploads.map(upload => {
      if (upload.id === uploadId) {
        let newUpvotes = upload.upvotes;
        let newDownvotes = upload.downvotes;

        // Remove previous vote if exists
        if (currentVote === 'up') {
          newUpvotes--;
        } else if (currentVote === 'down') {
          newDownvotes--;
        }

        // Add new vote if different from current
        if (currentVote !== voteType) {
          if (voteType === 'up') {
            newUpvotes++;
            newVotes[uploadId] = 'up';
          } else {
            newDownvotes++;
            newVotes[uploadId] = 'down';
          }
        } else {
          // Remove vote if same as current
          delete newVotes[uploadId];
        }

        return { ...upload, upvotes: newUpvotes, downvotes: newDownvotes };
      }
      return upload;
    });

    setUploads(updatedUploads);
    setUserVotes(newVotes);
    localStorage.setItem('noteshub_uploads', JSON.stringify(updatedUploads));
    localStorage.setItem(`noteshub_votes_${user?.id}`, JSON.stringify(newVotes));
  };

  const getFileTypeColor = (fileType: string) => {
    const colors = {
      'Notes': 'bg-blue-100 text-blue-800',
      'Syllabus': 'bg-green-100 text-green-800',
      'Past Exams': 'bg-red-100 text-red-800',
      'Exam Solutions': 'bg-purple-100 text-purple-800',
      'Homework': 'bg-orange-100 text-orange-800'
    };
    return colors[fileType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!user?.hasUploaded) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-columbia-blue rounded-lg flex items-center justify-center text-xl">
                ✏️
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">NotesHub @Columbia</h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate('/upload')}>
                Upload More
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Study Materials</h1>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search courses, professors, or materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedDepartment === '' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedDepartment('')}
                  >
                    All Departments
                  </Button>
                  {departments.map(dept => (
                    <Button
                      key={dept}
                      variant={selectedDepartment === dept ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      {dept}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {filteredUploads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No materials found</h3>
                <p className="text-gray-600 mb-4">
                  {uploads.length === 0 
                    ? "Be the first to upload some study materials!" 
                    : "Try adjusting your search or filter criteria"}
                </p>
                <Button 
                  onClick={() => navigate('/upload')}
                  className="bg-columbia-blue hover:bg-columbia-blue-dark"
                >
                  Upload Materials
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUploads.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{item.course}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">Prof. {item.professor}</p>
                        </div>
                        <Badge className={getFileTypeColor(item.fileType)}>
                          {item.fileType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">📄 {item.fileName}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <user className="h-4 w-4" />
                            <span>{item.username}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(item.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleVote(item.id, 'up')}
                              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                userVotes[item.id] === 'up' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <span>👍</span>
                              <span className="text-sm">{item.upvotes}</span>
                            </button>
                            <button
                              onClick={() => handleVote(item.id, 'down')}
                              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                                userVotes[item.id] === 'down' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <span>👎</span>
                              <span className="text-sm">{item.downvotes}</span>
                            </button>
                          </div>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
