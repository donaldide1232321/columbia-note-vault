import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
const Index = () => {
  const {
    isAuthenticated,
    login,
    signup,
    logout,
    user
  } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(24); // Changed from 247 to 24
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Simulate dynamic user count
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => {
        // Randomly add 0-2 users every 30 seconds
        const increment = Math.floor(Math.random() * 3);
        return prev + increment;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(loginForm.email, loginForm.password);
    setIsLoading(false);
    if (success) {
      toast({
        title: "Welcome back!"
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.username.length < 3) {
      toast({
        title: "Username too short",
        description: "Username must be at least 3 characters",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const success = await signup(signupForm.email, signupForm.password, signupForm.username);
    setIsLoading(false);
    if (success) {
      toast({
        title: "Account created successfully!"
      });
    } else {
      toast({
        title: "Signup failed",
        description: "Email or username already exists",
        variant: "destructive"
      });
    }
  };
  if (isAuthenticated) {
    return <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-columbia-blue rounded-lg flex items-center justify-center text-xl text-white">
                  ✏️
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">NotesHub @Columbia</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.username}!</span>
                <Button variant="outline" onClick={logout}>Sign Out</Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Share Knowledge, Build Community
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload and discover academic materials from Columbia University students. 
              Notes, syllabi, past exams, and solutions - all shared anonymously by the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user?.hasUploaded && <div className="bg-columbia-blue-light border border-columbia-blue rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    📚 <strong>Contribute first!</strong> Upload some materials before browsing to help build our community.
                  </p>
                </div>}
              
              <Button onClick={() => navigate('/upload')} className="bg-columbia-blue hover:bg-columbia-blue-dark text-white font-semibold px-8 py-3 text-lg">
                Upload Materials
              </Button>
              
              {user?.hasUploaded && <Button onClick={() => navigate('/browse')} variant="outline" className="border-columbia-blue text-columbia-blue hover:bg-columbia-blue-light font-semibold px-8 py-3 text-lg">
                  Browse Materials
                </Button>}
            </div>

            {!user?.hasUploaded && <p className="text-sm text-gray-500 mt-4">
                Browse materials will be available after your first upload
              </p>}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-columbia-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Study Materials</h3>
              <p className="text-gray-600">Notes, syllabi, and study guides from real Columbia students</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-columbia-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Past Exams</h3>
              <p className="text-gray-600">Practice with previous exams and their solutions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-columbia-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Anonymous Sharing</h3>
              <p className="text-gray-600">Share and discover materials with complete anonymity</p>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-columbia-blue rounded-2xl flex items-center justify-center text-3xl text-white">
            ✏️
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          NotesHub @Columbia
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">Columbia's 1st anonymous note-sharing platform. Share and discover academic materials anonymously</p>
        
        {/* Dynamic User Count */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-columbia-blue-light border border-columbia-blue">
            <span className="text-sm font-medium text-neutral-50">
              🎓 {userCount.toLocaleString()} students already joined
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Join the Community</CardTitle>
            <CardDescription>Sign in or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={loginForm.email} onChange={e => setLoginForm({
                    ...loginForm,
                    email: e.target.value
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={loginForm.password} onChange={e => setLoginForm({
                    ...loginForm,
                    password: e.target.value
                  })} required />
                  </div>
                  <Button type="submit" className="w-full bg-columbia-blue hover:bg-columbia-blue-dark" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={signupForm.email} onChange={e => setSignupForm({
                    ...signupForm,
                    email: e.target.value
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="username">Anonymous Username</Label>
                    <Input id="username" type="text" placeholder="e.g., StudyNinja2024" value={signupForm.username} onChange={e => setSignupForm({
                    ...signupForm,
                    username: e.target.value
                  })} required minLength={3} />
                    <p className="text-xs text-gray-500 mt-1">Choose a cryptic username for anonymity</p>
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signupForm.password} onChange={e => setSignupForm({
                    ...signupForm,
                    password: e.target.value
                  })} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full bg-columbia-blue hover:bg-columbia-blue-dark" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;