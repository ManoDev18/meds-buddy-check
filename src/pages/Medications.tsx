import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import supabase from '@/helpers/supabaseClient';
import { useToast } from "@/hooks/use-toast"; // ✅ import toast

type MedicationForm = {
    name: string;
    dosage: string;
    frequency: string;
};

const Medications = () => {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const navigate = useNavigate();
    const { toast } = useToast(); // ✅ initialize toast

    const form = useForm<MedicationForm>({
        defaultValues: {
            name: '',
            dosage: '',
            frequency: '',
        },
    });

    useEffect(() => {
        if (editId) {
            (async () => {
                const { data, error } = await supabase
                    .from('medications')
                    .select('*')
                    .eq('id', editId)
                    .single();

                if (error) {
                    console.error('Failed to fetch medication:', error.message);
                } else if (data) {
                    form.reset({
                        name: data.name,
                        dosage: data.dosage,
                        frequency: data.frequency,
                    });
                }
            })();
        }
    }, [editId, form]);

    const onSubmit = async (values: MedicationForm) => {
        const user = (await supabase.auth.getUser()).data.user;

        if (!user) {
            alert("Not authenticated");
            navigate('/login');
            return;
        }

        if (editId) {
            const { error } = await supabase
                .from('medications')
                .update(values)
                .eq('id', editId)
                .eq('user_id', user.id);

            if (error) {
                alert("Update failed");
                console.error(error.message);
            } else {
                toast({
                    title: "Medication Updated",
                    description: "The medication details have been successfully updated.",
                });
                navigate('/view-list');
            }
        } else {
            const { error } = await supabase
                .from('medications')
                .insert({ ...values, user_id: user.id });

            if (error) {
                alert("Insert failed");
                console.error(error.message);
            } else {
                toast({
                    title: "Medication Added",
                    description: "The medication has been successfully added.",
                });
                navigate('/view-list');
            }
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Sign out error:", error.message);
        } else {
            navigate("/login");
        }
    };

    return (
        <>
            <header className="bg-white/80 backdrop-blur-sm border-b border-border/20 p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link to="/" className='flex items-center gap-3'>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">MediCare Companion</h1>
                            </div>
                        </Link>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/view-list" className="font-medium hover:text-blue-500 duration-300">View List</Link>
                        <Link to="/medications" className="font-medium hover:text-blue-500 duration-300">Medications</Link>
                        <Button onClick={handleSignOut}>Signout</Button>
                    </div>
                </div>
            </header>

            <div className='max-w-2xl mx-auto flex items-center justify-center' style={{ height: 'calc(100vh - 81px)' }}>
                <div className='w-full border border-green-500 rounded-xl shadow-lg p-8'>
                    <h1 className='font-semibold text-3xl'>
                        {editId ? 'Edit Medication' : 'Add Medication'}
                    </h1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                placeholder="Name"
                                                className="p-4 w-full rounded-md border border-gray-300 outline-none focus:border-green-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dosage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dosage</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                placeholder="Dosage"
                                                className="p-4 w-full rounded-md border border-gray-300 outline-none focus:border-green-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="frequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                placeholder="Frequency"
                                                className="p-4 w-full rounded-md border border-gray-300 outline-none focus:border-green-500"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full text-xl outline-none bg-gradient-to-r from-blue-500 to-green-500 hover:shadow-lg transition-colors duration-300 ease-in-out rounded-2xl px-4 py-8 text-white font-medium mt-3"
                            >
                                {editId ? 'Update' : 'Submit'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default Medications;
