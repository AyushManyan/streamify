import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'
import OnboardingPage from './pages/OnboardingPage'
import { Route, Routes } from 'react-router'
import HomePage from './pages/Homepage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './libs/axios'

const App = () => {

  // tanstack query client can be added here if needed
  const { data, error , isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    }
  });

  console.log('Data:', {data});



  return (
    <div className='h-screen' data-theme="night">
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/call" element={<CallPage/>} />
        <Route path="/chat" element={<ChatPage/>} />
        <Route path="/onboarding" element={<OnboardingPage />} />

      </Routes>

      <Toaster/>
    </div>
  )
}

export default App