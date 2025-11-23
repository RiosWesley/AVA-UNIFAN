import React, { useEffect, useRef } from 'react'

const RemoteVideo = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      console.log("Anexando stream remota ao elemento de vídeo:", stream);
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-md bg-black" />;
};

export default RemoteVideo