import React, { useState } from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { completeOnboarding, updateUserDetails } from '../libs/api'; // <-- import updateUserDetails
import { CameraIcon, LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon } from 'lucide-react';
import { LANGUAGES } from '../constant';
import { useLocation } from 'react-router-dom'; // <-- import useLocation

const OnboardingPage = () => {

  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Determine if we're on the onboarding or update-details route
  const isUpdate = location.pathname === '/update-details';

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || ""
  });

  // Use the correct mutation function based on the route
  const { mutate: detailsMutation, isPending } = useMutation({
    mutationFn: isUpdate ? updateUserDetails : completeOnboarding,
    onSuccess: () => {
      toast.success(isUpdate ? "Details updated successfully!" : "Onboarding completed successfully!");
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || (isUpdate ? "Failed to update details. Please try again." : "Failed to complete onboarding. Please try again."));
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    detailsMutation(formState);
  }

  const handleRandomAvatar = () => {
    const randomId = Math.floor(Math.random() * 100000);
    const randomAvatar = `https://api.dicebear.com/8.x/adventurer/svg?seed=${randomId}`;
    setFormState({...formState, profilePic: randomAvatar });
    toast.success("Random avatar generated!");
  }

  return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center p-4'>
      <div className='card bg-base-200 w-full max-w-3xl shadow-xl'>
        <div className='card-body p-6 sm:p-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-center mb-6'>
            {isUpdate ? "Update Your Details" : "Complete Your Profile"}
          </h1>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* profile pic container */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {formState.profilePic ? (
                  <img
                    src={formState.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              {/* Generate random avatar BTN */}
              <div className='flex items-center gap-2'>
                <button type='button' onClick={handleRandomAvatar} className='btn btn-accent'>
                  <ShuffleIcon className='size-4 mr-2' />
                  Generate Random Avatar
                </button>
              </div>
            </div>
            {/* forma field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Full Name</span>
              </label>
              <input
                type="text"
                name='fullName'
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className='input input-bordered w-full'
                placeholder='Enter your full name'
              />
            </div>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Bio</span>
              </label>
              <input
                type="text"
                name='bio'
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className='input input-bordered w-full'
                placeholder='Enter a short bio about yourself'
              />
            </div>
            {/* language */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text'>Native Language</span>
                </label>
                <select
                  type="text"
                  name='nativeLanguage'
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className='input input-bordered w-full'
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text'>Learning Language</span>
                </label>
                <select
                  type="text"
                  name='learningLanguage'
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className='input input-bordered w-full'
                >
                  <option value="">Select the language you are learning</option>
                  {LANGUAGES.map((lang, index) => (
                    <option key={index} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* loaction */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Location</span>
              </label>
              <div className='relative '>
                <MapPinIcon className='absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70' />
                <input
                  type="text"
                  name='location'
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className='input input-bordered w-full pl-10'
                  placeholder='City, Country'
                />
              </div>
            </div>
            {/* submit button */}
            <button className='btn btn-primary w-full' type='submit' disabled={isPending}>
              {!isPending ? (
                <>
                  <ShipWheelIcon className='size-5 mr-2' />
                  {isUpdate ? "Update Details" : "Complete Onboarding"}
                </>
              ) : (
                <>
                  <LoaderIcon className='size-5 mr-2 animate-spin' />
                  {isUpdate ? "Updating..." : "Completing..."}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage