'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  Plane,
  Users,
  LogOut 
} from 'lucide-react';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Don't show sidebar on login page
  if (pathname === '/employee') {
    return <>{children}</>;
  }

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/employee/dashboard' },
    { title: 'Profile', icon: <User size={20} />, path: '/employee/profile' },
    { title: 'Flights', icon: <Plane size={20} />, path: '/employee/flights' },
    { title: 'Passengers', icon: <Users size={20} />, path: '/employee/passengers' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-black text-white w-${isOpen ? '64' : '16'} p-5 pt-8 relative duration-300 rounded-r-3xl shadow-lg`}>
        <div className="flex gap-x-4 items-center">
          <h1 className={`text-white origin-left font-bold text-xl duration-300 ${!isOpen && "scale-0"}`}>
            Employee Portal
          </h1>
        </div>

        <ul className="pt-6">
          {menuItems.map((menu, index) => (
            <Link href={menu.path} key={index}>
              <li className="flex rounded-md p-2 cursor-pointer hover:bg-gray-800 text-gray-300 text-sm items-center gap-x-4 mt-2">
                {menu.icon}
                <span className={`${!isOpen && "hidden"} origin-left duration-200`}>
                  {menu.title}
                </span>
              </li>
            </Link>
          ))}
        </ul>

        <div className="absolute bottom-4 w-full left-0 px-5">
          <button 
            className="flex items-center p-2 hover:bg-gray-800 rounded-md w-full text-gray-300"
            onClick={() => router.push('/')}
          >
            <LogOut size={20} />
            <span className={`${!isOpen && "hidden"} ml-4`}>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-7">
        {children}
      </div>
    </div>
  );
}