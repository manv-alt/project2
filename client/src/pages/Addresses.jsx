import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Plus, 
  Trash2, 
  Home,
  Briefcase,
  Building,
  X
} from "lucide-react";
import { toast } from "sonner";

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    type: "home"
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/addresses");
      setAddresses(res.data.addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post("/addresses", formData);
      toast.success("Address added successfully");
      setShowAddForm(false);
      setFormData({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        type: "home"
      });
      fetchAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(error.response?.data?.msg || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "work":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  const getAddressColor = (type) => {
    switch (type) {
      case "home":
        return "bg-blue-100 text-blue-600";
      case "work":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Add New Address
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      placeholder="123 Main Street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      name="zip"
                      placeholder="10001"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      placeholder="United States"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Address Type</Label>
                    <Select value={formData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Address"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card key={address._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getAddressColor(address.type)}`}>
                      {getAddressIcon(address.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {address.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {address.zip}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state}
                      </p>
                      <p className="text-sm text-gray-500">
                        {address.country}
                      </p>
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(address._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-500 mb-4">
                Add your first address to make checkout faster
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Addresses;
