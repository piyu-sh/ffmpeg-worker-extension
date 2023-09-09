import React, { useState, useRef, useEffect } from 'react';
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
      console.log("🚀 ~ file: Sandbox.jsx:17 ~ ffmpeg.on ~ message:", message)
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

    await ffmpeg.exec([
      '-i',
      'input.webm',
      '-c',
      'copy',
      '-fflags',
      '+genpts',
      'output.webm',
    ]);

    ffmpeg.deleteFile('input.webm')
    const data = await ffmpeg.readFile('output.webm');
    ffmpeg.deleteFile('output.webm')

    window.top.postMessage(
      {
        type: 'msg',
        data: data,
      },
      '*',
      [data.buffer]
    );
  };

  useEffect(() => {
    window.onmessage = async function (e) {
      if (e.data.type == 'msg') {
        await load()

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile(
          'input.webm',
          new Uint8Array(e.data.data)
        );

      }
    };
  }, [])

  return loaded ? (
    <>
      {/* <video ref={videoRef} controls></video> */}
      <br />
      <button onClick={transcode}>Transcode</button>
      <p ref={messageRef}></p>
    </>
  ) : (
    <></>
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
