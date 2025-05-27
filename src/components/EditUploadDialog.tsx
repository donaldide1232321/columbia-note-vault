
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2 } from 'lucide-react';

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

interface EditUploadDialogProps {
  upload: Upload;
  currentUserId: string;
  onUpdate: () => void;
}

const EditUploadDialog: React.FC<EditUploadDialogProps> = ({ upload, currentUserId, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    course: upload.course,
    professor: upload.professor,
    fileType: upload.file_type,
    label: upload.label
  });

  const fileTypes = [
    'Notes',
    'Syllabus', 
    'Past Exams',
    'Exam Solutions',
    'Homework',
    'Cheat Sheet',
    'Study Guide'
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('uploads')
        .update({
          course: formData.course,
          professor: formData.professor,
          file_type: formData.fileType,
          label: formData.label
        })
        .eq('id', upload.id);

      if (error) throw error;

      toast({ title: "Upload updated successfully!" });
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating upload:', error);
      toast({ title: "Failed to update upload", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', upload.id);

      if (error) throw error;

      toast({ title: "Upload deleted successfully!" });
      onUpdate();
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast({ title: "Failed to delete upload", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Only show edit/delete options if this is the user's upload
  if (upload.user_id !== currentUserId) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Edit className="h-3 w-3" />
            Edit
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Update the details of your upload
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-course">Course</Label>
              <Input
                id="edit-course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-professor">Professor</Label>
              <Input
                id="edit-professor"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-fileType">File Type</Label>
              <Select value={formData.fileType} onValueChange={(value) => setFormData({ ...formData, fileType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {fileTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this upload? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditUploadDialog;
