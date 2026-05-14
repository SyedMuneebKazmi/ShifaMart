import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import MessageList from './MessageList';
import QuickSuggestions from './QuickSuggestions';
import Button from '../ui/Button';
import Input from '../ui/Input';
import aiService from '@services/ai';

const AiChat = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your ShifaMart+ health assistant. How can I help you today?',
      timestamp: new Date(),
      actions: [
        { label: 'Check Symptoms', action: 'check_symptoms' },
        { label: 'Upload Prescription', action: 'upload_prescription' }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      // Call real AI service
      const response = await aiService.chat(inputValue);
      const aiData = response.data || response;
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiData.response || 'I understand. Could you tell me more about your symptoms?',
        timestamp: new Date(),
        actions: aiData.suggestions?.map(s => ({ label: s, action: s })) || []
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat error:', error);
      // Fallback response if AI service fails
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I understand. Could you tell me more about your symptoms?',
        timestamp: new Date(),
        actions: []
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    // Handle structured actions
    console.log('Action clicked:', action);
    // Navigate or trigger specific flows
  };

  const suggestions = [
    "I have a headache",
    "Compare medicine prices",
    "Find a doctor",
    "Emergency help"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-neutral-200 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-500 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <h3 className="font-semibold">AI Health Assistant</h3>
        </div>
        <button onClick={onClose} className="hover:bg-primary-600 p-1 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <MessageList messages={messages} onActionClick={handleActionClick} />
      <div ref={messagesEndRef} />

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50">
        <QuickSuggestions 
          suggestions={suggestions} 
          onSelect={(text) => setInputValue(text)} 
        />
        
        <div className="flex gap-2 mt-2">
          <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-white border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button 
            size="sm" 
            onClick={handleSend} 
            disabled={!inputValue.trim() || loading}
            className="!px-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
