import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Puzzle, Menu, User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: "홈", href: "/" },
    { name: "동호회 탐색", href: "/communities" },
    { name: "번개 모임", href: "/lightning-meetups" },
    { name: "프로필", href: "/profile" },
  ];

  const isActive = (href: string) => {
    return location === href;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Puzzle className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-gray-900">HobbyConnect</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImageUrl} 
                      alt={user?.firstName || "사용자"}
                    />
                    <AvatarFallback>
                      {user?.firstName ? user.firstName.charAt(0) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">프로필</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/communities">동호회</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
