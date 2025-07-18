import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { Link, useLocation } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../libs/api';
import { BellIcon, LockIcon, LogOutIcon, ShipWheelIcon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith('/chat');
  const queryClient = useQueryClient();

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authUser'] }),
  });



  return (
    <nav className='bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center'>
      <div className="p-2 border-b border-base-300 lg:hidden sm:p-5 flex-shrink-0">
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <ShipWheelIcon className="size-4 text-primary  sm:size-6" />
          <span className="text-lg sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Streamify
          </span>
        </Link>
      </div>
      <div className='container mx-auto px-2 sm:px-6 lg:px-8'>

        <div className='flex items-center justify-end w-full gap-2'>

          {/* logo -only in the chat page */}

          {isChatPage && (
            <div className='pl-5'>
              <Link className='flex items-center gap-2.5' to='/'>
                <ShipWheelIcon className='size-9 text-primary' />
                <span className='text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider'>
                  Streamify
                </span>

              </Link>
            </div>
          )}


          <div className='flex items-center justify-between p-2 bg-base-100 ml-auto'>
            <Link to={"/notifications"}>
              <button className='btn btn-ghost btn-circle'>
                <BellIcon className='size-6 text-base-content opacity-70' />
              </button>
            </Link>

          </div>
          <div className=''>
            <Link to="/change-password">
              <button className='btn btn-ghost btn-circle'>
                <LockIcon className='size-6 text-base-content opacity-70' />
              </button>
            </Link>
          </div>

          <ThemeSelector />


          <div className="avatar">
            <div className="w-9 rounded-full">
              <Link to='/update-details'>
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </Link>
            </div>
          </div>



          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>

        </div>

      </div>

    </nav >
  )
}

export default Navbar