import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Upload = () => {
  const { user, updateUserUploadStatus } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course: '',
    professor: '',
    fileType: '',
    label: '',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const fileTypes = [
    'Notes',
    'Syllabus', 
    'Past Exams',
    'Exam Solutions',
    'Homework',
    'Cheat Sheet'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select a file smaller than 50MB", variant: "destructive" });
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course || !formData.professor || !formData.fileType || !formData.label || !formData.file) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Authentication required", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate unique file path
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Starting file upload:', { fileName, filePath, fileSize: formData.file.size });

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, formData.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Store upload metadata in database
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          username: user.username,
          course: formData.course,
          professor: formData.professor,
          file_type: formData.fileType,
          label: formData.label,
          file_name: formData.file.name,
          file_url: publicUrl
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      await updateUserUploadStatus();
      setIsUploading(false);
      toast({ title: "Upload successful!", description: "Your material has been shared with the community" });
      navigate('/');
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Please try again", 
        variant: "destructive" 
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

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
            <Button variant="outline" onClick={handleBackToHome}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Study Materials
          </h1>
          <p className="text-lg text-gray-600">
            Share your notes, exams, and other materials to help fellow Columbia students
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-columbia-blue">📤</span>
              Upload New Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="course" className="text-base font-semibold">Course</Label>
                <Input
                  id="course"
                  placeholder="e.g., MATH 1102, ECON 1105, COMS 3157"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="mt-1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter the course code and name</p>
              </div>

              <div>
                <Label htmlFor="professor" className="text-base font-semibold">Professor Name</Label>
                <Input
                  id="professor"
                  placeholder="Enter professor's name"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="fileType" className="text-base font-semibold">File Type</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, fileType: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="label" className="text-base font-semibold">File Label</Label>
                <Input
                  id="label"
                  placeholder="Brief description of your file (e.g., 'Midterm 1 Study Guide')"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="mt-1"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Help others understand what your file contains</p>
              </div>

              <div>
                <Label htmlFor="file" className="text-base font-semibold">File Upload</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-columbia-blue transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-columbia-blue hover:text-columbia-blue-dark">
                        <span>Upload a file</span>
                        <input
                          id="file"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.ppt,.pptx,.xls,.xlsx"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, PPT, XLS, TXT, or image files up to 50MB</p>
                    {formData.file && (
                      <p className="text-sm text-columbia-blue font-medium">Selected: {formData.file.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-columbia-blue hover:bg-columbia-blue-dark font-semibold py-3"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload Material'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Upload;
