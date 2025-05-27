import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, User, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EditUploadDialog from '@/components/EditUploadDialog';

interface Upload {
  id: string;
  user_id: string;
  username: string;
  course: string;
  professor: string;
  file_type: string;
  label: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  upvotes: number;
  downvotes: number;
}

interface Vote {
  upload_id: string;
  vote_type: 'up' | 'down';
}

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<Upload[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});

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

    fetchUploads();
    fetchUserVotes();
  }, [user, navigate]);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
      setFilteredUploads(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('upload_id, vote_type')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const votesMap: Record<string, 'up' | 'down'> = {};
      data?.forEach((vote: Vote) => {
        votesMap[vote.upload_id] = vote.vote_type;
      });
      setUserVotes(votesMap);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  useEffect(() => {
    let filtered = uploads;

    if (searchTerm) {
      filtered = filtered.filter(upload =>
        upload.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        upload.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUploads(filtered);
  }, [uploads, searchTerm]);

  const handleVote = async (uploadId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      const currentVote = userVotes[uploadId];
      
      if (currentVote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('upload_id', uploadId);
        
        // Update vote counts
        const field = voteType === 'up' ? 'upvotes' : 'downvotes';
        await supabase
          .from('uploads')
          .update({ [field]: uploads.find(u => u.id === uploadId)?.[field]! - 1 })
          .eq('id', uploadId);

        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[uploadId];
          return newVotes;
        });
      } else {
        // Add or update vote
        await supabase
          .from('votes')
          .upsert({
            user_id: user.id,
            upload_id: uploadId,
            vote_type: voteType
          });

        // Update vote counts
        const upload = uploads.find(u => u.id === uploadId);
        if (upload) {
          let newUpvotes = upload.upvotes;
          let newDownvotes = upload.downvotes;

          // Remove previous vote if exists
          if (currentVote === 'up') {
            newUpvotes--;
          } else if (currentVote === 'down') {
            newDownvotes--;
          }

          // Add new vote
          if (voteType === 'up') {
            newUpvotes++;
          } else {
            newDownvotes++;
          }

          await supabase
            .from('uploads')
            .update({ upvotes: newUpvotes, downvotes: newDownvotes })
            .eq('id', uploadId);
        }

        setUserVotes(prev => ({ ...prev, [uploadId]: voteType }));
      }

      // Refresh uploads
      fetchUploads();
    } catch (error) {
      console.error('Error handling vote:', error);
      toast({ title: "Error updating vote", variant: "destructive" });
    }
  };

  const handleDownload = (upload: Upload) => {
    // Create a mock download - in a real app, this would download the actual file
    const element = document.createElement('a');
    const file = new Blob([`Mock file content for: ${upload.file_name}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = upload.file_name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({ title: "Download started", description: `Downloading ${upload.file_name}` });
  };

  const getFileTypeColor = (fileType: string) => {
    const colors = {
      'Notes': 'bg-blue-100 text-blue-800',
      'Syllabus': 'bg-green-100 text-green-800',
      'Past Exams': 'bg-red-100 text-red-800',
      'Exam Solutions': 'bg-purple-100 text-purple-800',
      'Homework': 'bg-orange-100 text-orange-800',
      'Cheat Sheet': 'bg-yellow-100 text-yellow-800',
      'Study Guide': 'bg-pink-100 text-pink-800'
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
              <div className="w-10 h-10 bg-columbia-blue rounded-lg flex items-center justify-center text-xl text-white">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Study Materials</h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Input
                placeholder="Search by course (e.g., MATH 1102, ECON 1105), professor, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {filteredUploads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-600 mb-4">
                {uploads.length === 0 
                  ? "Be the first to upload some study materials!" 
                  : "Try adjusting your search criteria"}
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
                      <Badge className={getFileTypeColor(item.file_type)}>
                        {item.file_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">📄 {item.file_name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{item.username}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(item.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Edit/Delete options for user's own uploads */}
                      {user && item.user_id === user.id && (
                        <div className="pt-2 border-t">
                          <EditUploadDialog 
                            upload={item} 
                            currentUserId={user.id} 
                            onUpdate={fetchUploads} 
                          />
                        </div>
                      )}
                      
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
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
  );
};

export default Browse;
