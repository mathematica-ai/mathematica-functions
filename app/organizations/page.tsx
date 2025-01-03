import { useState, useEffect } from "react";
import axios from "axios";

interface Organization {
  _id: string;
  name: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get("/api/organizations");
      setOrganizations(response.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const createOrganization = async () => {
    try {
      await axios.post("/api/organizations", { name: newOrgName });
      setNewOrgName("");
      fetchOrganizations();
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      await axios.delete(`/api/organizations/${id}`);
      fetchOrganizations();
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Organizations</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newOrgName}
          onChange={(e) => setNewOrgName(e.target.value)}
          placeholder="New Organization Name"
          className="input input-bordered mr-2"
        />
        <button onClick={createOrganization} className="btn btn-primary">
          Create
        </button>
      </div>
      <ul className="list-disc pl-5">
        {organizations.map((org) => (
          <li key={org._id} className="mb-2">
            {org.name}
            <button
              onClick={() => deleteOrganization(org._id)}
              className="btn btn-sm btn-error ml-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 