import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ReadingModal from '../components/ReadingModal';

const AppLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenAdd = () => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reading) => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Notify child routes to reload their data
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#fafafc]">
      {/* Sidebar for Desktop */}
      <Sidebar onOpenAddModal={handleOpenAdd} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenAddModal={handleOpenAdd} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet
            context={{
              openAddModal: handleOpenAdd,
              openEditModal: handleOpenEdit,
              refreshTrigger,
              triggerRefresh: () => setRefreshTrigger((prev) => prev + 1),
            }}
          />
        </main>
      </div>

      {/* Global Add / Edit Reading Modal */}
      <ReadingModal
        isOpen={isModalOpen}
        readingToEdit={editingReading}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AppLayout;
