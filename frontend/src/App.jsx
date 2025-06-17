import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'
import OnboardingPage from './pages/OnboardingPage'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Homepage'
import { Toaster } from 'react-hot-toast'
import PageLoader from './components/PageLoader'
import useAuthUser from './hooks/useAuthUser'
import Layout from './components/Layout'
import { useThemeStore } from './store/useThemeStore'

const App = () => {

  const { isLoading, authUser } = useAuthUser();
  const {theme} = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;


  if (isLoading) {
    return (
      <PageLoader />
    )
  }


  return (
    <div className='h-screen' data-theme={theme}>
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ? (
          <Layout showSiderbar={true}>
            <HomePage />
          </Layout>
        ) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />)} />

        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

        <Route path="/notifications" element={isAuthenticated && isOnboarded ? (
          <Layout showSiderbar={true}>
            <NotificationPage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />

        <Route path="/call/:id" element={isAuthenticated && isOnboarded ? (
            <CallPage />
          
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />

        <Route path="/chat/:id" element={isAuthenticated && isOnboarded ?(
          <Layout showSiderbar={false}>
            <ChatPage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />

        <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? (
          <OnboardingPage />
        ) : (
          <Navigate to="/" />
        )) : (
          <Navigate to="/login" />
        )} />

      </Routes>

      <Toaster />
    </div>
  )
}

export default App