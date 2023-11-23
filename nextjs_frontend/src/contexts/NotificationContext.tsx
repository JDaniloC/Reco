"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { INotification } from "@/types/notification.dto";
import { apiURL } from "@/config";

import io, { Socket } from 'socket.io-client';
import { useSession } from "next-auth/react";

interface NotificationContext {
  notifications: INotification[];
  removeNotification: (notification: string) => void;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationContext = createContext<NotificationContext | null>(null);

export function NotificationProvider({
  children
}: NotificationProviderProps) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    if (!session || socket !== null
      || typeof apiURL === "undefined"
    ) return;
    const newSocket = io(apiURL, {
      path: "/wss/socket.io",
      transports: ["websocket"],
      auth: { email: session?.user?.email }
    });

    setSocket(newSocket);
    newSocket.on('notification', data => {
      setNotifications(prev => [...prev, data])
    })
  }, [session])

  function removeNotification(notificationID: string) {
    setNotifications(prev => prev.filter(n => n.identifier !== notificationID));
    if (socket) socket.emit('remove-notification', notificationID);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("NotificationContext not found!");
  return context;
}
