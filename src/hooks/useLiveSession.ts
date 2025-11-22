
import { toast } from '@/components/ui/toast';
import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};


export const useLiveSession = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const setupWebRTCHandlers = useCallback((socket: Socket) => {
    
    const createPeerConnection = (otherSocketId: string): RTCPeerConnection => {
     
      if (peerConnectionsRef.current.has(otherSocketId)) {
        return peerConnectionsRef.current.get(otherSocketId)!;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(otherSocketId, pc);

      console.log(`[WebRTC] Criou PeerConnection para ${otherSocketId}`);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { toSocketId: otherSocketId, candidate: event.candidate });
        }
      };
      
      pc.ontrack = (event) => {
        console.log(`%c[WebRTC] ONTRACK: Recebeu stream de ${otherSocketId}`, 'color: lightgreen; font-weight: bold;');
        setRemoteStreams(prev => new Map(prev).set(otherSocketId, event.streams[0]));
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      return pc;
    };

    socket.on('user-connected', async ({ userId, socketId }) => {
      console.log(`[Signal] Usuário ${userId} (${socketId}) conectou. Criando oferta...`);
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { toSocketId: socketId, offer });
    });

    socket.on('offer', async ({ fromSocketId, offer }) => {
      console.log(`[Signal] Recebeu oferta de ${fromSocketId}`);
      const pc = createPeerConnection(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { toSocketId: fromSocketId, answer });
    });

    socket.on('answer', async ({ fromSocketId, answer }) => {
      console.log(`[Signal] Recebeu resposta de ${fromSocketId}`);
      const pc = peerConnectionsRef.current.get(fromSocketId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ fromSocketId, candidate }) => {
      const pc = peerConnectionsRef.current.get(fromSocketId);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch(e) { 
          console.error('[WebRTC] Erro ao adicionar candidato ICE:', e); 
        }
      }
    });

    socket.on('user-disconnected', ({ socketId }) => {
      console.warn(`[Signal] Usuário com socket ${socketId} desconectou.`);
      
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(socketId);
      }
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    });
  }, []); 

  const joinSession = useCallback(async (classId: string, userId: string) => {
    if (socketRef.current?.connected) {
      console.warn("Já existe uma sessão ativa. Desconectando primeiro.");
      socketRef.current.disconnect();
    }

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
        console.log(`%c[Socket] Conectado com sucesso! ID: ${socket.id}. Entrando na sala...`, 'color: green; font-weight: bold;');
        socket.emit('join-room', { classId, userId });
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.warn(`[Socket] Desconectado: ${reason}`);
      });

      socket.on('connect_error', (err) => {
        console.error(`%c[Socket] Erro de Conexão: ${err.message}`, 'color: red; font-weight: bold;', err);
        toast({ title: "Erro de Conexão", description: "Não foi possível conectar ao servidor de aula." });
        leaveSession();
      });
      
      setupWebRTCHandlers(socket);
      
    } catch (error) {
      console.error("Falha ao entrar na sessão (provavelmente permissão de câmera/microfone negada):", error);
      toast({ title: "Erro de Câmera/Microfone", description: "Permita o acesso à câmera e microfone para continuar."});
    }
  }, [setupWebRTCHandlers]);

  const leaveSession = useCallback(() => {
    console.log("Saindo da sessão e limpando recursos...");

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    
    socketRef.current?.disconnect();
    socketRef.current = null;

    setIsConnected(false);
    setRemoteStreams(new Map());
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
    localVideoRef,
    remoteStreams, 
  };
};