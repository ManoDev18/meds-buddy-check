import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '@/helpers/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
};

const ViewList = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takenToday, setTakenToday] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchMedications = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch medications error:", error.message);
      } else {
        setMedications(data as Medication[]);
      }
    } catch (err) {
      console.error("Error fetching medications:", err);
    }
  };

  const fetchTakenToday = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('medication_logs')
        .select('medication_id')
        .eq('user_id', user.id)
        .eq('date', today);

      if (!error && data) {
        setTakenToday(data.map((log) => log.medication_id));
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const { error } = await supabase.from('medications').delete().eq('id', id);
        if (error) {
          console.error("Delete error:", error.message);
        } else {
          fetchMedications();
          fetchTakenToday();
        }
      } catch (err) {
        console.error("Error deleting medication:", err);
      }
    }
  };

  const markAsTaken = async (medicationId: number) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('medication_logs').insert({
        user_id: user.id,
        medication_id: medicationId,
        date: today,
      });

      if (!error) {
        fetchTakenToday();
      } else {
        console.error("Error marking as taken:", error.message);
      }
    } catch (err) {
      console.error("Error in markAsTaken:", err);
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

  useEffect(() => {
    fetchMedications();
    fetchTakenToday();
  }, []);

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

      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Medication List</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>{med.frequency}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/medications?edit=${med.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(med.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="default"
                    disabled={takenToday.includes(med.id)}
                    onClick={() => markAsTaken(med.id)}
                    className='bg-gradient-to-r from-blue-500 to-green-500'
                  >
                    {takenToday.includes(med.id) ? 'Taken Today' : 'Mark as Taken'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ViewList;
