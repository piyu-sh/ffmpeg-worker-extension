import React from 'react';
import logo from '../../assets/img/logo.svg';
import './Newtab.css';
import './Newtab.scss';

window.onmessage = function (e) {
  if (e.data.type == 'msg') {
    const fixedData = e.data.data;
    const fixedBlob = new Blob([fixedData.buffer], { type: 'video/webm' });
    const blobUrl = URL.createObjectURL(fixedBlob);
    chrome.downloads.download(
      {
        url: blobUrl,
        filename: 'out.webm',
      },
      downloadId => {
        if (downloadId) {
          URL.revokeObjectURL(blobUrl);
          const ffmpegIframe = document.getElementById(
            'theFrame'
          );
          ffmpegIframe.src = ffmpegIframe.src // reload iframe to free memory
        } else {
          console.error('🚀 ~ download failed');
        }
      }
    );
  }
};

const Newtab = () => {

  async function fileHandler() {
    const [fileHandle] = await window.showOpenFilePicker();
    //@ts-ignore
    const file = await fileHandle.getFile();
    const fileAB = await file.arrayBuffer();

    const ffmpegIframe = document.getElementById(
      'theFrame'
    );
    ffmpegIframe.contentWindow.postMessage(
      {
        type: 'msg',
        data: fileAB,
      },
      '*',
      [fileAB]
    );

  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          This is the main page
        </p>
      </header>
      <button onClick={fileHandler}>load file to transcode</button>
    </div>
  );
};

export default Newtab;
