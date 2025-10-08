import React, { useState } from 'react';
import { User, UserRole } from '../../types';

interface UserTableProps {
  users: User[];
  onRemoveUser: (email: string) => void;
  isLoading: boolean;
}

const StaticStars: React.FC<{ rating: number; max?: number }> = ({ rating, max = 5 }) => {
  return (
    <div className="flex items-center">
      {[...Array(max)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const UserTable: React.FC<UserTableProps> = ({ users, onRemoveUser, isLoading }) => {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const handleRowClick = (user: User) => {
    if (user.role !== UserRole.DRIVER) return;
    setExpandedUserId(prevId => (prevId === user.id ? null : user.id));
  };

  const handleRemoveClick = (email: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      onRemoveUser(email);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-slate-500">Loading users...</div>;
  }
  
  if (users.length === 0) {
    return <div className="text-center p-8 text-slate-500 bg-slate-50/50 rounded-b-2xl">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {users.map((user) => {
            const isDriver = user.role === UserRole.DRIVER;
            const isExpanded = expandedUserId === user.id;
            const hasRatings = user.ratings && user.ratings.length > 0;
            const averageRating = hasRatings ? user.ratings!.reduce((a, b) => a + b, 0) / user.ratings!.length : 0;

            return (
              <React.Fragment key={user.id}>
                <tr 
                  onClick={() => handleRowClick(user)} 
                  className={`transition-colors ${isDriver ? 'cursor-pointer hover:bg-slate-50' : ''} ${isExpanded ? 'bg-slate-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.profilePictureUrl} alt={`${user.name}'s profile`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user.role}</div>
                      </div>
                      {isDriver && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-auto text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveClick(user.email, user.name); }}
                      className="text-red-600 hover:text-red-900 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                      disabled={user.email === '23034567@mvula.univen.ac.za'}
                      title={user.email === '23034567@mvula.univen.ac.za' ? 'Cannot remove admin' : 'Remove user'}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
                {isDriver && isExpanded && (
                  <tr className="bg-slate-100/70">
                    <td colSpan={3} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-600 mb-2">Average Rating</h4>
                          {hasRatings ? (
                            <div className="flex items-center gap-2">
                              <StaticStars rating={averageRating} />
                              <span className="font-bold text-slate-800 text-lg">{averageRating.toFixed(1)}</span>
                              <span className="text-sm text-slate-500">({user.ratings!.length} ratings)</span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No ratings yet.</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-600 mb-2">Individual Ratings</h4>
                          {hasRatings ? (
                            <div className="flex flex-wrap gap-2">
                              {user.ratings!.map((r, i) => (
                                <div key={i} className="flex items-center bg-slate-200 rounded-full px-2.5 py-1">
                                  <span className="text-xs font-bold text-slate-700">{r}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">N/A</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;