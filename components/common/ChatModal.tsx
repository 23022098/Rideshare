import React, { useState, useEffect, useRef } from 'react';
import { Trip } from '../../types';
import { useAppState } from '../../contexts/AppContext';
import { firestoreDB } from '../../services/firebaseService';
import Button from './Button';

interface ChatModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ trip, isOpen, onClose }) => {
  const { state } = useAppState();
  const user = state.user!;
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = user.role === 'customer' 
    ? { name: trip.driverName || 'Driver', id: trip.driverId }
    : { name: trip.customerName, id: trip.customerId };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [trip.messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    try {
      await firestoreDB.sendMessage(trip.id, user.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[80vh] max-h-[700px] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Chat with {otherParticipant.name}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold">&times;</button>
        </header>
        
        <main className="flex-grow p-4 overflow-y-auto bg-slate-50">
          <div className="space-y-4">
            {trip.messages?.map((msg, index) => {
              const isSentByUser = msg.senderId === user.id;
              return (
                <div key={index} className={`flex items-end gap-2 ${isSentByUser ? 'justify-end' : 'justify-start'}`}>
                  {!isSentByUser && otherParticipant.id && (
                    <img src={`https://picsum.photos/seed/${otherParticipant.id}/100`} className="h-6 w-6 rounded-full" alt="avatar" />
                  )}
                  <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${isSentByUser ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                   {isSentByUser && user.profilePictureUrl && (
                    <img src={user.profilePictureUrl} className="h-6 w-6 rounded-full" alt="avatar" />
                  )}
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </main>
        
        <footer className="p-4 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow appearance-none block w-full px-4 py-3 border border-slate-200 bg-slate-100 rounded-full shadow-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:bg-white sm:text-sm transition-colors"
              autoFocus
            />
            <Button type="submit" isLoading={isSending} disabled={isSending || !messageText.trim()} className="!w-auto !rounded-full !p-3.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatModal;