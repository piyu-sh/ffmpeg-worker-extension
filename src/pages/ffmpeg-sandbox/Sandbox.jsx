import React, { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

function FfmpegTest() {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', ({ message }) => {
      messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      ),
    });
    setLoaded(true);
  };

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(
      'input.avi',
      await fetchFile('/video/video-15s.avi')
    );
    await ffmpeg.exec(['-i', 'input.avi', 'output.mp4']);
    const data = await ffmpeg.readFile('output.mp4');
    videoRef.current.src = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );
  };

  return loaded ? (
    <>
      <video ref={videoRef} controls></video>
      <br />
      <button onClick={transcode}>Transcode avi to mp4</button>
      <p ref={messageRef}></p>
    </>
  ) : (
    <button onClick={load}>Load ffmpeg-core</button>
  );
}

const Sandbox = () => {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          This is the sandbox page
        </p>
        <FfmpegTest />
      </header>
    </div>
  );
};

export default Sandbox;
