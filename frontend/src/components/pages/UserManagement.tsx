import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userApi } from '@/services/api';

interface UserFormData {
    email: string;
    password: string;
    passwordConfirmation: string;
    role: 'admin' | 'instructor' | 'student' | 'parent';
}

const UserManagement: React.FC = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        passwordConfirmation: '',
        role: 'student'
    });

    const handleInputChange = (field: keyof UserFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleRoleChange = (value: UserFormData['role']) => {
        setFormData(prev => ({
            ...prev,
            role: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.passwordConfirmation) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive"
            });
            return;
        }

        try {
            await userApi.createUser({
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            toast({
                title: "Success",
                description: "User created successfully",
            });

            // Reset form
            setFormData({
                email: '',
                password: '',
                passwordConfirmation: '',
                role: 'student'
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create user",
                variant: "destructive"
            });
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>Add a new user to the system</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            required
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            required
                            placeholder="Enter password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                        <Input
                            id="passwordConfirmation"
                            type="password"
                            value={formData.passwordConfirmation}
                            onChange={handleInputChange('passwordConfirmation')}
                            required
                            placeholder="Confirm password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={handleRoleChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full">
                        Create User
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserManagement;
