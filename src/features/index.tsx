import { useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icon';
import FileDownloaderProgressBar from './FileDownloaderProgressBar';

const files: string[] = [
  'https://images.unsplash.com/photo-1604264849633-67b1ea2ce0a4',
  'https://images.unsplash.com/photo-1628856860837-208e8e66e288',
  'https://images.unsplash.com/photo-1604263439201-171fb8c0fddc',
  'https://images.unsplash.com/photo-1607205854688-e2d8654b0c2e',
];

const Feature = () => {
  const [downloadQueueFiles, setDownloadQueueFiles] = useState<string[]>([]);

  const download = async (newUrl: string) => {
    if (newUrl) {
      if (!!downloadQueueFiles?.filter((url) => url === newUrl).length) {
        toast.error('This file already downloading.');
        return false;
      }

      setDownloadQueueFiles((prevFiles) => [...prevFiles, newUrl]);
    }
  };

  return (
    <div className="relative px-5 py-2">
      <div className="flex justify-center">
        <div className="w-[50vw] h-full">
          <h2 className="flex justify-between items-center font-semibold text-black mb-2">Download Files</h2>
          <div className="flex w-full h-[75vh] justify-center items-start border border-dashed border-black text-white p-4">
            <div className="w-full text-black grid grid-cols-4">
              {!!files?.length &&
                files?.map((url: string, index: number) => (
                  <>
                    <div className="w-36">
                      <button
                        onClick={() => download(url)}
                        className="flex justify-center items-center space-x-2 bg-yellow-300 px-2 py-1 rounded mt-1"
                      >
                        <Icon name="cloud-download" className="w-6 h-6" /> <span>File - {index + 1}</span>
                      </button>
                    </div>
                  </>
                ))}
            </div>
          </div>
        </div>
      </div>
      <FileDownloaderProgressBar
        downloadQueueFiles={downloadQueueFiles}
        setDownloadQueueFiles={setDownloadQueueFiles}
      />
    </div>
  );
};

export default Feature;
