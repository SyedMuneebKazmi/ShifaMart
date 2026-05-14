import { RouterProvider } from 'react-router-dom';
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import router from './routes';
import AiChat from '@components/ai/AiChat';
import useAuthStore from '@stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <RouterProvider router={router} />
      
      {/* Global AI Chat Widget - Only visible when logged in */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}
          <AiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </>
  );
}

export default App;
