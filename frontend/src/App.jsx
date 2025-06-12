import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'
import OnboardingPage from './pages/OnboardingPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Homepage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './libs/axios'

const App = () => {

  // tanstack query client can be added here if needed
  const { data:authData, error , isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    },
    retry: false,
  });

  const authUser = authData?.user;



  return (
    <div className='h-screen' data-theme="night">
      <Routes>
        <Route path="/" element={authUser?<HomePage/>:<Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser?<SignUpPage />:<Navigate to="/"/>} />
        <Route path="/login" element={!authUser?<LoginPage />:<Navigate to="/"/>} />
        <Route path="/notifications" element={authUser?<NotificationPage />:<Navigate to="/login"/>} />
        <Route path="/call" element={authUser?<CallPage/>:<Navigate to="/login"/>} />
        <Route path="/chat" element={authUser?<ChatPage/>:<Navigate to="/login"/>} />
        <Route path="/onboarding" element={authUser?<OnboardingPage />:<Navigate to="/login"/>} />

      </Routes>

      <Toaster/>
    </div>
  )
}

export default App