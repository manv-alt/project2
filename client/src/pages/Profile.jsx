import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  ArrowLeft, 
  Loader2,
  Home,
  Briefcase,
  Building
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile");
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load profile</p>
          <Button onClick={fetchProfile} variant="outline">
            Try Again
          </Button>
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
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-2xl font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user.gender}
                </Badge>
                <Button
                  className="mt-4 w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/profile/edit")}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.phone || "Not added"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Addresses</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.addresses?.length || 0} saved
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Saved Addresses
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => navigate("/addresses")}
                >
                  Manage Addresses
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((address) => (
                    <div
                      key={address._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAddressIcon(address.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 capitalize">
                              {address.type}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {address.zip}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.state}
                          </p>
                          <p className="text-sm text-gray-500">{address.country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No addresses saved yet</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/addresses")}
                  >
                    Add Your First Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
