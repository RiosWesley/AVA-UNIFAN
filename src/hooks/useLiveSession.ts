
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
      // Verificar se já existe uma conexão
      if (peerConnectionsRef.current.has(otherSocketId)) {
        const existingPc = peerConnectionsRef.current.get(otherSocketId)!;
        const state = existingPc.signalingState;
        const connectionState = existingPc.connectionState;
        
        console.log(`[WebRTC] Conexão existente para ${otherSocketId} - signalingState: ${state}, connectionState: ${connectionState}`);
        
        // Se a conexão está em estado inválido ou fechado, recriar
        if (state === 'closed' || connectionState === 'closed' || connectionState === 'failed') {
          console.warn(`[WebRTC] Conexão existente para ${otherSocketId} está em estado inválido (${state}/${connectionState}). Fechando e recriando...`);
          existingPc.close();
          peerConnectionsRef.current.delete(otherSocketId);
        } else if (state === 'stable') {
          // Se está em estado stable, podemos reutilizar
          console.log(`[WebRTC] Reutilizando conexão existente para ${otherSocketId}`);
          return existingPc;
        } else {
          // Se está em processo de negociação, também podemos reutilizar
          console.log(`[WebRTC] Reutilizando conexão em negociação para ${otherSocketId}`);
          return existingPc;
        }
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(otherSocketId, pc);

      console.log(`[WebRTC] Criou nova PeerConnection para ${otherSocketId} - signalingState: ${pc.signalingState}`);

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
      try {
        const pc = createPeerConnection(socketId);
        const currentState = pc.signalingState;
        console.log(`[WebRTC] Estado antes de criar offer: ${currentState}`);
        
        // Verificar se está em estado stable antes de criar offer
        if (currentState !== 'stable') {
          console.warn(`[WebRTC] Tentando criar offer em estado incorreto: ${currentState}. Aguardando estado stable...`);
          // Se não estiver em stable, fechar e recriar
          pc.close();
          peerConnectionsRef.current.delete(socketId);
          const newPc = createPeerConnection(socketId);
          const offer = await newPc.createOffer();
          await newPc.setLocalDescription(offer);
          socket.emit('offer', { toSocketId: socketId, offer });
        } else {
          const offer = await pc.createOffer();
          console.log(`[WebRTC] Offer criado. Estado antes de setLocalDescription: ${pc.signalingState}`);
          await pc.setLocalDescription(offer);
          console.log(`[WebRTC] Offer definido localmente. Novo estado: ${pc.signalingState}`);
          socket.emit('offer', { toSocketId: socketId, offer });
        }
      } catch (error) {
        console.error(`[WebRTC] Erro ao criar/definir offer para ${socketId}:`, error);
      }
    });

    socket.on('offer', async ({ fromSocketId, offer }) => {
      console.log(`[Signal] Recebeu oferta de ${fromSocketId}`);
      try {
        // Sempre fechar conexão existente quando recebemos uma nova offer
        // Isso evita problemas com conexões já estabelecidas
        const existingPc = peerConnectionsRef.current.get(fromSocketId);
        if (existingPc) {
          const existingState = existingPc.signalingState;
          console.log(`[WebRTC] Fechando conexão existente para ${fromSocketId} (estado: ${existingState}) antes de processar nova offer`);
          existingPc.close();
          peerConnectionsRef.current.delete(fromSocketId);
        }
        
        // Garantir que não há conexão no Map antes de criar nova
        // (proteção contra race conditions)
        if (peerConnectionsRef.current.has(fromSocketId)) {
          const leftoverPc = peerConnectionsRef.current.get(fromSocketId);
          if (leftoverPc) {
            leftoverPc.close();
          }
          peerConnectionsRef.current.delete(fromSocketId);
        }
        
        // Criar nova conexão limpa (não deve reutilizar, pois acabamos de limpar)
        const pc = createPeerConnection(fromSocketId);
        const currentState = pc.signalingState;
        console.log(`[WebRTC] Nova conexão criada. Estado antes de processar offer: ${currentState}`);
        
        // Verificar se está em estado 'stable' (deve estar, pois é uma nova conexão)
        if (currentState !== 'stable') {
          console.error(`[WebRTC] Estado incorreto para nova conexão: ${currentState}. Esperado: stable`);
          return;
        }
        
        // Processar a offer
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const newStateAfterRemote = pc.signalingState;
        console.log(`[WebRTC] Offer remota definida. Novo estado: ${newStateAfterRemote}`);
        
        // Verificar se o estado está correto antes de criar answer
        if (newStateAfterRemote !== 'have-remote-offer') {
          console.error(`[WebRTC] Estado incorreto após setRemoteDescription: ${newStateAfterRemote}. Esperado: have-remote-offer`);
          return;
        }
        
        const answer = await pc.createAnswer();
        const stateAfterCreateAnswer = pc.signalingState;
        console.log(`[WebRTC] Answer criado. Estado antes de setLocalDescription: ${stateAfterCreateAnswer}`);
        
        // Verificar novamente o estado antes de definir answer local
        // O estado deve continuar sendo 'have-remote-offer' após createAnswer
        if (stateAfterCreateAnswer === 'have-remote-offer') {
          await pc.setLocalDescription(answer);
          console.log(`[WebRTC] Answer definido localmente. Novo estado: ${pc.signalingState}`);
          socket.emit('answer', { toSocketId: fromSocketId, answer });
        } else {
          console.error(`[WebRTC] Estado incorreto para definir answer: ${stateAfterCreateAnswer}. Esperado: have-remote-offer`);
        }
      } catch (error) {
        console.error(`[WebRTC] Erro ao processar offer de ${fromSocketId}:`, error);
      }
    });

    socket.on('answer', async ({ fromSocketId, answer }) => {
      console.log(`[Signal] Recebeu resposta de ${fromSocketId}`);
      const pc = peerConnectionsRef.current.get(fromSocketId);
      if (pc) {
        try {
          const currentState = pc.signalingState;
          console.log(`[WebRTC] Estado antes de processar answer: ${currentState}`);
          
          // Verificar se está no estado correto antes de definir answer remota
          if (currentState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log(`[WebRTC] Answer remota definida. Novo estado: ${pc.signalingState}`);
          } else {
            console.warn(`[WebRTC] Estado incorreto para definir answer remota: ${currentState}. Esperado: have-local-offer`);
          }
        } catch (error) {
          console.error(`[WebRTC] Erro ao processar answer de ${fromSocketId}:`, error);
        }
      } else {
        console.warn(`[WebRTC] PeerConnection não encontrada para ${fromSocketId}`);
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