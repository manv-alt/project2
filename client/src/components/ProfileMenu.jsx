import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  ShoppingBag, 
  LogOut, 
  Pencil, 
  Settings, 
  Heart,
  CreditCard,
  MapPin,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [initialProfileView, setInitialProfileView] = useState("profile");
  const navigate = useNavigate();

  // ✅ SAFE initials calculation
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openProfileModal = (view = "profile") => {
    setInitialProfileView(view);
    setProfileModalOpen(true);
    setIsOpen(false);
  };

  const handleMyOrders = () => {
    navigate("/my-orders");
    setIsOpen(false);
  };

  const menuItems = [
    { icon: User, label: "My Profile", onClick: () => openProfileModal("profile"), color: "text-blue-600" },
    { icon: Pencil, label: "Edit Profile", onClick: () => openProfileModal("edit"), color: "text-purple-600" },
    { icon: ShoppingBag, label: "My Orders", onClick: handleMyOrders, color: "text-orange-600" },
    { icon: MapPin, label: "Saved Addresses", onClick: () => openProfileModal("addresses"), color: "text-teal-600" },
    { icon: Settings, label: "Settings", onClick: () => {/* TODO: Add settings modal/page */}, color: "text-gray-600" },
  ];


  if (loading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="outline-none focus:outline-none">
        <Avatar className="cursor-pointer transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-green-500 hover:ring-offset-2">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold transition-all duration-300 hover:from-green-500 hover:to-green-700">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        sideOffset={8}
      >
        {/* USER INFO HEADER */}
        <div className="relative px-4 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-3 border-white shadow-md">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-green-600 font-medium">Welcome back,</p>
              <p className="font-bold text-gray-900 truncate text-lg">{user?.name || "User"}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* MENU ITEMS */}
        <div className="py-2">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-400 px-4 py-2">
            Account
          </DropdownMenuLabel>
          
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="gap-3 cursor-pointer px-4 py-3 mx-2 rounded-lg transition-all duration-200 hover:bg-green-50 hover:translate-x-1 group"
              onClick={item.onClick}
            >
              <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-sm group-hover:shadow-md transition-all duration-200 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <span className="flex-1 font-medium text-gray-700 group-hover:text-gray-900">
                {item.label}
              </span>
              <ChevronRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-gray-100" />

        {/* LOGOUT SECTION */}
        <div className="py-2 px-2">
          <DropdownMenuItem
            className="gap-3 cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-50 hover:translate-x-1 group"
            onClick={handleLogout}
          >
            <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white shadow-sm group-hover:shadow-md transition-all duration-200 text-red-500">
              <LogOut size={18} />
            </div>
            <span className="flex-1 font-medium text-red-600 group-hover:text-red-700">
              Logout
            </span>
          </DropdownMenuItem>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
            Version 1.0.0 • Powered by YourBrand
          </p>
        </div>
      </DropdownMenuContent>

      {/* Profile Modal */}
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
        initialView={initialProfileView}
      />
    </DropdownMenu>
  );
};

export default ProfileMenu;
