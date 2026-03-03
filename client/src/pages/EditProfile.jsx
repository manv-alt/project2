import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Phone, 
  Camera,
  Save
} from "lucide-react";
import { toast } from "sonner";

const EditProfile = () => {
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    profileImage: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      const user = res.data.user;
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        profileImage: user.profileImage || ""
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/profile", formData);
      toast.success("Profile updated successfully");
      
      // Update auth context user
      if (setAuthUser) {
        setAuthUser(prev => ({
          ...prev,
          ...formData
        }));
      }
      
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-1">Update your personal information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 mb-4">
                  {formData.profileImage ? (
                    <AvatarImage src={formData.profileImage} alt={formData.name} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-bold">
                    {getInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full max-w-xs">
                  <Label htmlFor="profileImage" className="flex items-center gap-2 cursor-pointer justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Profile Image URL</span>
                  </Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.profileImage}
                    onChange={handleChange}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a URL for your profile picture
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/profile")}
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
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
