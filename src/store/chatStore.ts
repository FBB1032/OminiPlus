import { create } from 'zustand';
import { storageService } from '../services/storageService';

export interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  senderRole: 'patient' | 'doctor';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isUrgent?: boolean;
  attachment?: {
    name: string;
    type: 'pdf' | 'image';
    size: string;
    url?: string;
  };
  prescription?: {
    diagnosis: string;
    medications: Array<{ name: string; dosage: string; frequency: string }>;
  };
}

interface ChatStore {
  messagesByAppointment: Record<string, ChatMessage[]>;
  isLoading: boolean;
  loadMessages: (appointmentId: string) => Promise<ChatMessage[]>;
  sendMessage: (appointmentId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'status' | 'appointmentId'>) => Promise<ChatMessage>;
  markMessagesAsRead: (appointmentId: string, currentRole: 'patient' | 'doctor') => Promise<void>;
  clearChat: (appointmentId: string) => Promise<void>;
}

const STORAGE_PREFIX = 'ominipulse_chat_';

const DEFAULT_INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'appt-1': [
    {
      id: 'msg-init-1',
      appointmentId: 'appt-1',
      senderId: 'd-1',
      senderRole: 'doctor',
      text: 'Hello, welcome to our telemedicine session. I have reviewed your latest blood pressure and glucose logs. How are you feeling today?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-init-2',
      appointmentId: 'appt-1',
      senderId: 'p-1',
      senderRole: 'patient',
      text: 'Good day Doctor. I have been feeling slightly dizzy in the mornings, especially after taking my medication.',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-init-3',
      appointmentId: 'appt-1',
      senderId: 'd-1',
      senderRole: 'doctor',
      text: 'Understood. Let us review your medication timing. Please make sure to take your Lisinopril after food, and ensure you drink at least 2 liters of water daily.',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      status: 'read',
    },
  ],
};

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByAppointment: {},
  isLoading: false,

  loadMessages: async (appointmentId: string) => {
    set({ isLoading: true });
    try {
      const stored = await storageService.getItem<ChatMessage[]>(`${STORAGE_PREFIX}${appointmentId}`);
      let messages: ChatMessage[];
      if (stored && stored.length > 0) {
        messages = stored;
      } else {
        messages = DEFAULT_INITIAL_MESSAGES[appointmentId] || [
          {
            id: `init-${appointmentId}`,
            appointmentId,
            senderId: 'd-1',
            senderRole: 'doctor',
            text: 'Hello! I am ready for your consultation. Please share any symptoms or questions you have today.',
            timestamp: new Date().toISOString(),
            status: 'read',
          },
        ];
        await storageService.setItem(`${STORAGE_PREFIX}${appointmentId}`, messages);
      }

      set((state) => ({
        messagesByAppointment: {
          ...state.messagesByAppointment,
          [appointmentId]: messages,
        },
        isLoading: false,
      }));
      return messages;
    } catch {
      set({ isLoading: false });
      return [];
    }
  },

  sendMessage: async (appointmentId, messageData) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      appointmentId,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };

    const currentMessages = get().messagesByAppointment[appointmentId] || [];
    const updatedMessages = [...currentMessages, newMessage];

    set((state) => ({
      messagesByAppointment: {
        ...state.messagesByAppointment,
        [appointmentId]: updatedMessages,
      },
    }));

    await storageService.setItem(`${STORAGE_PREFIX}${appointmentId}`, updatedMessages);
    return newMessage;
  },

  markMessagesAsRead: async (appointmentId, currentRole) => {
    const currentMessages = get().messagesByAppointment[appointmentId] || [];
    let hasChanges = false;

    const updated = currentMessages.map((msg) => {
      if (msg.senderRole !== currentRole && msg.status !== 'read') {
        hasChanges = true;
        return { ...msg, status: 'read' as const };
      }
      return msg;
    });

    if (hasChanges) {
      set((state) => ({
        messagesByAppointment: {
          ...state.messagesByAppointment,
          [appointmentId]: updated,
        },
      }));
      await storageService.setItem(`${STORAGE_PREFIX}${appointmentId}`, updated);
    }
  },

  clearChat: async (appointmentId) => {
    set((state) => ({
      messagesByAppointment: {
        ...state.messagesByAppointment,
        [appointmentId]: [],
      },
    }));
    await storageService.removeItem(`${STORAGE_PREFIX}${appointmentId}`);
  },
}));
