// import { useEffect } from 'react';
// import { groupApi } from '@/services/api';
// import { Group, CreateGroupPayload, GroupStatus } from '@/types/group';
// import { useToast } from '@/hooks/use-toast';
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import * as z from 'zod'
// import { Button } from "@/components/ui/button"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Teacher } from '@/types'
// import { Card, CardContent } from "@/components/ui/card"
// import { Pencil, Trash2, Users } from "lucide-react"
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"

// const formSchema = z.object({
//   name: z.string().min(2, {
//     message: "Name must be at least 2 characters.",
//   }),
//   description: z.string().min(10, {
//     message: "Description must be at least 10 characters.",
//   }),
//   language: z.string({
//     required_error: "Please select a language.",
//   }),
//   level: z.string({
//     required_error: "Please select a level.",
//   }),
//   maxCapacity: z.number().min(1).max(50),
//   teacherId: z.string({
//     required_error: "Please select a teacher.",
//   }),
// });

// type FormValues = z.infer<typeof formSchema>;

// const LANGUAGES = [
//   "ENGLISH",
//   "FRENCH",
//   "SPANISH",
//   "GERMAN",
//   "CHINESE"
// ] as const;

// const LEVELS = [
//   "BEGINNER",
//   "INTERMEDIATE",
//   "ADVANCED",
//   "PROFICIENT"
// ] as const;

// interface GroupManagementProps {
//   onSuccess?: () => void;
//   groups: Group[];
//   setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
//   teachers: Teacher[];
// }

// export function GroupManagement({ 
//   onSuccess, 
//   setGroups,
//   groups,
//   teachers 
// }: GroupManagementProps) {
//   const { toast } = useToast();

//   useEffect(() => {
//     loadGroups();
//   }, []);

//   const loadGroups = async () => {
//     try {
//       const response = await groupApi.getAll();
//       setGroups(response.data);
//     } catch (error) {
//       console.error('Error loading groups:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load groups',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleCreateGroup = async (values: FormValues) => {
//     try {
//       const payload: CreateGroupPayload = {
//         name: values.name,
//         description: values.description,
//         language: values.language,
//         level: values.level,
//         max_capacity: values.maxCapacity,
//         teacher: values.teacherId,
//         status: 'ACTIVE' as GroupStatus
//       };

//       await groupApi.create(payload);
//       toast({
//         title: 'Success',
//         description: 'Group created successfully',
//       });
//       loadGroups();
//       onSuccess?.();
//     } catch (error) {
//       console.error('Error creating group:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to create group',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDeleteGroup = async (groupId: string) => {
//     try {
//       await groupApi.delete(groupId);
//       toast({
//         title: 'Success',
//         description: 'Group deleted successfully',
//       });
//       loadGroups();
//     } catch (error) {
//       console.error('Error deleting group:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to delete group',
//         variant: 'destructive',
//       });
//     }
//   };

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       language: undefined,
//       level: undefined,
//       maxCapacity: 1,
//       teacherId: undefined,
//     },
//   });

//   async function onSubmit(values: FormValues) {
//     try {
//       await handleCreateGroup(values);
//       form.reset();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to create group",
//         variant: "destructive",
//       });
//     }
//   }

//   return (
//     <div className="space-y-8">
//       <h2 className="text-2xl font-bold">Group Management</h2>
      
//       {/* Group List */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {groups?.map((group) => (
//           <Card key={group.id} className="hover:shadow-lg transition-shadow">
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold">{group.name}</h3>
//                   <p className="text-sm text-gray-500">{group.description}</p>
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <div>
//                     <span className="font-medium">Language:</span>
//                     <span className="ml-2">{group.language}</span>
//                   </div>
//                   <div>
//                     <span className="font-medium">Level:</span>
//                     <span className="ml-2">{group.level}</span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-sm">
//                   <Users className="h-4 w-4 text-gray-500" />
//                   <span>{group.current_capacity}/{group.max_capacity} students</span>
//                 </div>

//                 <div className="flex justify-end gap-2">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
//                   >
//                     <Pencil className="h-4 w-4" />
//                   </Button>
//                   <AlertDialog>
//                     <AlertDialogTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-600 hover:text-red-800 hover:bg-red-50"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>Delete Group</AlertDialogTitle>
//                         <AlertDialogDescription>
//                           Are you sure you want to delete this group? This action cannot be undone.
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                       <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction
//                           onClick={() => handleDeleteGroup(group.id.toString())}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           Delete
//                         </AlertDialogAction>
//                       </AlertDialogFooter>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Create Group Form */}
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Group Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Advanced English Class" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
          
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Description</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Advanced level English class for proficient speakers" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="language"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Language</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a language" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {LANGUAGES.map((lang) => (
//                       <SelectItem key={lang} value={lang}>
//                         {lang}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="level"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Level</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a level" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {LEVELS.map((level) => (
//                       <SelectItem key={level} value={level}>
//                         {level}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="maxCapacity"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Maximum Capacity</FormLabel>
//                 <FormControl>
//                   <Input 
//                     type="number" 
//                     min="1"
//                     max="50"
//                     {...field} 
//                     onChange={e => field.onChange(+e.target.value)} 
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="teacherId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Assign Teacher</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select a teacher" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {teachers.map((teacher) => (
//                       <SelectItem key={teacher.id} value={teacher.id}>
//                         {teacher.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <Button type="submit">Create Group</Button>
//         </form>
//       </Form>
//     </div>
//   );
// }

