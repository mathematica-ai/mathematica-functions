'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { apiService } from '@/libs/apiService';
import DataTable from '@/components/ui/DataTable';
const columns = [
    { key: 'name', label: 'Name' },
    { key: 'address', label: 'Address' },
];
export default function OrganisationsPage() {
    const [organisations, setOrganisations] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        loadOrganisations();
    }, []);
    const loadOrganisations = async () => {
        try {
            const response = await apiService.organisations.getAll();
            setOrganisations(response.data);
        }
        catch (error) {
            console.error('Failed to load organisations:', error);
            toast.error('Failed to load organisations');
        }
        finally {
            setLoading(false);
        }
    };
    const handleEdit = (id) => {
        router.push(`/dashboard/organisations/${id}`);
    };
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this organisation?')) {
            try {
                await apiService.organisations.delete(id);
                setOrganisations(organisations.filter(org => org.id !== id));
                toast.success('Organisation deleted successfully');
            }
            catch (error) {
                console.error('Failed to delete organisation:', error);
                toast.error('Failed to delete organisation');
            }
        }
    };
    if (loading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>);
    }
    return (<div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <button onClick={() => router.push('/dashboard/organisations/new')} className="btn btn-primary">
          Add Organisation
        </button>
      </div>

      <DataTable data={organisations} columns={columns} onEdit={handleEdit} onDelete={handleDelete}/>
    </div>);
}
