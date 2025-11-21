import { toast } from '@/components/ui/toast';
import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export const useLiveSession = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setupWebRTCHandlers = useCallback((socket: Socket) => {
    const createPeerConnection = (otherSocketId: string) => {
      if (peerConnectionsRef.current.has(otherSocketId)) {
        return peerConnectionsRef.current.get(otherSocketId)!;
      }
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(otherSocketId, pc);

      pc.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', { toSocketId: otherSocketId, candidate: event.candidate });
        }
      };
      
      pc.ontrack = event => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }
      return pc;
    };

    socket.on('user-connected', async ({ userId, socketId }) => {
      console.log(`User ${userId} connected. Creating offer...`);
      setParticipants(prev => [...prev, socketId]);
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { toSocketId: socketId, offer });
    });

    socket.on('answer', async ({ fromSocketId, answer }) => {
      const pc = peerConnectionsRef.current.get(fromSocketId);
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ fromSocketId, candidate }) => {
      const pc = peerConnectionsRef.current.get(fromSocketId);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('user-disconnected', ({ socketId }) => {
      setParticipants(prev => prev.filter(id => id !== socketId));
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(socketId);
      }
      if (peerConnectionsRef.current.size === 0 && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
  }, []);

  const joinSession = useCallback(async (classId: string, userId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        transports: ['websocket'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join-room', { classId, userId });
      });

      socket.on('disconnect', () => setIsConnected(false));
      
      setupWebRTCHandlers(socket);
      
    } catch (error) {
      console.error("Failed to join session:", error);
      toast({ title: "Erro de Câmera/Conexão" });
    }
  }, [setupWebRTCHandlers]);

  const leaveSession = useCallback(() => {
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setParticipants([]);
  }, []);
  

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, [leaveSession]);

  return { 
    joinSession, 
    leaveSession, 
    isConnected,
    participants,
    localVideoRef,
    remoteVideoRef
  };
};