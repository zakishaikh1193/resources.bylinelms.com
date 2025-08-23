import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  Home,
  FileText,
  Grid3X3,
  Database,
  Shield,
  LogOut,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: 'overview' | 'users' | 'content' | 'metadata' | 'settings';
  onTabChange: (tab: 'overview' | 'users' | 'content' | 'metadata' | 'settings') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: Array<{
    id: 'overview' | 'users' | 'content' | 'metadata' | 'settings';
    label: string;
    icon: any;
    description: string;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Dashboard overview and analytics'
    },
    {
      id: 'users',
      label: 'School Management',
      icon: Users,
      description: 'Manage school accounts and access'
    },
    {
      id: 'metadata',
      label: 'Metadata',
      icon: Tag,
      description: 'Manage grades, subjects, and tags'
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: BookOpen,
      description: 'Create and manage educational resources'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Profile management and admin settings'
    }
  ];

  const handleTabClick = (tabId: 'overview' | 'users' | 'content' | 'metadata' | 'settings') => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

             {/* Sidebar */}
       <div className={`
         fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ease-in-out shadow-lg flex flex-col
         ${isCollapsed ? 'w-20' : 'w-80'}
         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
       `}>
                          {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
           <div className="flex items-center justify-center">
             {!isCollapsed && (
               <div className="text-center">
                 <h1 className="text-2xl font-bold text-white tracking-wide">Byline Resource Sharing</h1>
                 <p className="text-blue-100 text-sm mt-1 font-medium">Admin Dashboard</p>
               </div>
             )}
           </div>
                     <button
             onClick={onToggleCollapse}
             className="hidden lg:flex p-3 rounded-lg hover:bg-white hover:bg-opacity-20 hover:shadow-sm transition-all duration-200"
             title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
           >
             {isCollapsed ? (
               <ChevronRight className="w-6 h-6 text-white" />
             ) : (
               <ChevronLeft className="w-6 h-6 text-white" />
             )}
           </button>
        </div>

        

                 {/* Navigation */}
         <nav className="flex-1 p-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
                                              <button
                   key={item.id}
                   onClick={() => handleTabClick(item.id)}
                   className={`
                     w-full flex items-start space-x-4 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden
                     ${isActive 
                       ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm' 
                       : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-sm'
                     }
                   `}
                   title={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                 >
                 <div className={`
                   flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-1
                   ${isActive ? 'text-blue-600 scale-110' : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-105'}
                 `}>
                   <Icon className={`${isCollapsed ? 'w-7 h-7' : 'w-6 h-6'}`} />
                 </div>
                 {!isCollapsed && (
                   <div className="flex-1 text-left min-w-0">
                     <p className="text-base font-medium truncate">{item.label}</p>
                     <p className="text-sm text-gray-500 leading-relaxed mt-1 line-clamp-2">{item.description}</p>
                   </div>
                 )}
                 {isActive && !isCollapsed && (
                   <div className="w-1 h-10 bg-blue-600 rounded-full absolute right-2"></div>
                 )}
               </button>
            );
          })}
        </nav>

                 {/* Footer */}
         <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-red-50">
           <button
             onClick={logout}
             className={`
               w-full flex items-center space-x-4 px-4 py-4 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 hover:shadow-sm transition-all duration-200 group
               ${isCollapsed ? 'justify-center' : ''}
             `}
             title={isCollapsed ? "Logout" : undefined}
           >
             <LogOut className="w-6 h-6 text-gray-500 group-hover:text-red-600 group-hover:scale-105 transition-transform" />
             {!isCollapsed && (
               <span className="text-base font-medium">Logout</span>
             )}
           </button>
         </div>
      </div>

    </>
  );
};

export default Sidebar;
