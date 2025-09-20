
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Pill, Clock, Calendar as CalendarIcon, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, query } from 'firebase/firestore';
import type { MedicationReminder as MedicationReminderType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const reminderSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  startDate: z.date({ required_error: 'Please select a start date.' }),
  endDate: z.date({ required_error: 'Please select an end date.' }),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export function MedicationReminder() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<MedicationReminderType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const q = query(collection(db, 'users', user.uid, 'medications'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userReminders: MedicationReminderType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userReminders.push({
            id: doc.id,
            ...data,
            startDate: (data.startDate as any).toDate(),
            endDate: (data.endDate as any).toDate(),
        } as MedicationReminderType);
      });
      setReminders(userReminders.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reminders: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch medication reminders.',
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      medicineName: '',
      dosage: '',
      time: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  async function onSubmit(data: ReminderFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated' });
        return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'medications'), {
        ...data,
        taken: false,
      });

      // Webhook integration
      try {
        await fetch('https://swapranit.app.n8n.cloud/webhook-test/medication-reminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.uid,
                medicineName: data.medicineName,
                dosage: data.dosage,
                time: data.time,
                startDate: format(data.startDate, 'yyyy-MM-dd'),
                endDate: format(data.endDate, 'yyyy-MM-dd'),
            }),
        });
      } catch (webhookError) {
          console.error("Error sending webhook: ", webhookError);
          // Non-blocking, so we don't show an error to the user for this
      }

      toast({
        title: 'Success',
        description: 'Medication reminder added.',
      });
      form.reset();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add reminder. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTakenChange = async (reminderId: string, taken: boolean) => {
    if (!user) return;
    const reminderRef = doc(db, 'users', user.uid, 'medications', reminderId);
    try {
        await updateDoc(reminderRef, { taken: taken });
    } catch (error) {
        console.error("Error updating reminder: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Failed to update reminder status."
        })
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add New Reminder</CardTitle>
          <CardDescription>Fill out the details below to add a new medication.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Paracetamol" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 500mg, 1 tablet" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="time" {...field} className="pl-10" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                            >
                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              
              <Button type="submit" className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Add Reminder
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>Here are your scheduled medications.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className={cn("flex items-center space-x-4 rounded-md p-4 border transition-colors", reminder.taken ? "bg-muted/50 border-dashed" : "bg-card")}>
                  <Checkbox id={`reminder-${reminder.id}`} checked={reminder.taken} onCheckedChange={(checked) => handleTakenChange(reminder.id, Boolean(checked))} className="h-5 w-5" />
                  <div className={cn("grid gap-1.5 flex-1", reminder.taken && "text-muted-foreground line-through")}>
                    <label htmlFor={`reminder-${reminder.id}`} className="font-bold text-lg leading-none">
                      {reminder.medicineName}
                    </label>
                    <p className="text-sm">{reminder.dosage}</p>
                    <div className="flex items-center gap-4 text-xs">
                        <span className='flex items-center gap-1'><CalendarIcon className="h-3 w-3"/>{format(reminder.startDate, 'PPP')} <ArrowRight className='h-3 w-3 mx-1' /> {format(reminder.endDate, 'PPP')}</span>
                        <span className='flex items-center gap-1'><Clock className="h-3 w-3"/>{reminder.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <Pill className="mx-auto h-12 w-12" />
              <p className="mt-4">No medication reminders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
