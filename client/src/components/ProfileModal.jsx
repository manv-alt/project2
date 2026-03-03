import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Loader2,
  Home,
  Briefcase,
  Building,
  Plus,
  Trash2,
  ArrowLeft,
  X,
  Camera,
  Save,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const ProfileModal = ({ open, onOpenChange, initialView = "profile" }) => {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [view, setView] = useState(initialView); // profile, edit, addresses

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: ""
  });
  
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    type: "home"
  });
  
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    if (open) {
      setView(initialView);
      fetchData();
    }
  }, [open, initialView]);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressesRes] = await Promise.all([
        api.get("/profile"),
        api.get("/addresses")
      ]);
      setUser(profileRes.data.user);
      setAddresses(addressesRes.data.addresses);
      setFormData({
        name: profileRes.data.user.name || "",
        phone: profileRes.data.user.phone || "",
        profileImage: profileRes.data.user.profileImage || ""
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value) => {
    setAddressForm(prev => ({ ...prev, type: value }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/profile", formData);
      toast.success("Profile updated successfully");
      setUser(res.data.user);
      if (setAuthUser) {
        setAuthUser(prev => ({ ...prev, ...formData }));
      }
      setView("profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post("/addresses", addressForm);
      toast.success("Address added successfully");
      setAddressForm({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        type: "home"
      });
      setShowAddAddress(false);
      const res = await api.get("/addresses");
      setAddresses(res.data.addresses);
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error(error.response?.data?.msg || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Address deleted successfully");
      setAddresses(prev => prev.filter(addr => addr._id !== id));
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "home": return <Home className="w-4 h-4" />;
      case "work": return <Briefcase className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getAddressColor = (type) => {
    switch (type) {
      case "home": return "bg-blue-100 text-blue-600";
      case "work": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const resetAndClose = () => {
    setView("profile");
    setShowAddAddress(false);
    onOpenChange(false);
  };

  // Profile View
  const renderProfileView = () => (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
          {user?.profileImage ? (
            <AvatarImage src={user.profileImage} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xl font-bold">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <Badge variant="secondary" className="mt-1 capitalize">
            {user?.gender}
          </Badge>
        </div>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setView("edit")}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-green-600" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Phone className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.phone || "Not added"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Addresses Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Saved Addresses ({addresses.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700"
            onClick={() => setView("addresses")}
          >
            Manage
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {addresses.length > 0 ? (
          <div className="space-y-2">
            {addresses.slice(0, 2).map((address) => (
              <div
                key={address._id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-white"
              >
                <div className={`p-2 rounded-lg ${getAddressColor(address.type)}`}>
                  {getAddressIcon(address.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 capitalize text-sm">
                      {address.type}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {address.zip}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {address.street}, {address.city}
                  </p>
                </div>
              </div>
            ))}
            {addresses.length > 2 && (
              <p className="text-xs text-gray-500 text-center">
                +{addresses.length - 2} more addresses
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">No addresses saved</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("addresses")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Address
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Edit Profile View
  const renderEditView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView("profile")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Edit Profile</h2>
      </div>

      <form onSubmit={updateProfile} className="space-y-4">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-20 h-20 mb-3">
            {formData.profileImage ? (
              <AvatarImage src={formData.profileImage} alt={formData.name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-xl font-bold">
              {getInitials(formData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Label htmlFor="profileImage" className="flex items-center gap-2 cursor-pointer justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-sm">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Profile Image URL</span>
            </Label>
            <Input
              id="profileImage"
              name="profileImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.profileImage}
              onChange={handleProfileChange}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleProfileChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-500" />
            Phone Number
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleProfileChange}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setView("profile")}
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
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  // Addresses View
  const renderAddressesView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setView("profile");
              setShowAddAddress(false);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
          </Button>
          <h2 className="text-lg font-semibold">Saved Addresses</h2>
        </div>
        {!showAddAddress && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowAddAddress(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {showAddAddress && (
        <div className="p-4 border-2 border-dashed border-green-300 rounded-xl bg-green-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-green-900">Add New Address</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddAddress(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={addAddress} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="street"
                placeholder="Street"
                value={addressForm.street}
                onChange={handleAddressChange}
                required
                className="col-span-2"
              />
              <Input
                name="city"
                placeholder="City"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
              />
              <Input
                name="state"
                placeholder="State"
                value={addressForm.state}
                onChange={handleAddressChange}
                required
              />
              <Input
                name="zip"
                placeholder="ZIP"
                value={addressForm.zip}
                onChange={handleAddressChange}
                required
              />
              <Input
                name="country"
                placeholder="Country"
                value={addressForm.country}
                onChange={handleAddressChange}
                required
              />
              <Select value={addressForm.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowAddAddress(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address._id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${getAddressColor(address.type)}`}>
                {getAddressIcon(address.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 capitalize text-sm">
                    {address.type}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {address.zip}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  {address.street}, {address.city}, {address.state}
                </p>
                <p className="text-xs text-gray-500">{address.country}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => deleteAddress(address._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No addresses saved yet</p>
            <Button
              variant="outline"
              onClick={() => setShowAddAddress(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Address
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white">

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === "profile" && (
              <>
                <User className="w-5 h-5 text-green-600" />
                My Profile
              </>
            )}
            {view === "edit" && (
              <>
                <Edit className="w-5 h-5 text-green-600" />
                Edit Profile
              </>
            )}
            {view === "addresses" && (
              <>
                <MapPin className="w-5 h-5 text-green-600" />
                Saved Addresses
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {view === "profile" && renderProfileView()}
        {view === "edit" && renderEditView()}
        {view === "addresses" && renderAddressesView()}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
