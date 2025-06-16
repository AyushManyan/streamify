import React from 'react'
import SideBar from './SideBar'
import Navbar from './Navbar'

const Layout = ({children, showSiderbar = false}) => {
  return (
    <div className='h-screen flex flex-col'>
      <div className='flex flex-1 min-h-0'>
        {showSiderbar && <SideBar />}
        <div className='flex-1 flex flex-col min-h-0'>
          <Navbar/>
          <main className='flex-1 overflow-y-auto min-h-0'>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
