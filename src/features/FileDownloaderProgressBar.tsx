import axios from 'axios';
import { memo, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icon';
import { bytesToMB } from 'utils/helpers';

interface FileDownloaderProgressBarProps {
  downloadQueueFiles: string[];
  setDownloadQueueFiles: Function;
}

interface SingleItemDownloadProps {
  setDownloadQueueFiles: Function;
  downloadUrl: string;
}

const FileDownloaderProgressBar = (props: FileDownloaderProgressBarProps) => {
  const { downloadQueueFiles, setDownloadQueueFiles } = props;

  if (!downloadQueueFiles?.length) return null;

  return (
    <div className="absolute right-0 bottom-0 w-auto mr-2 bg-gray-300 p-2 z-50 rounded-sm">
      <div className="w-full text-xs py-1">
        {downloadQueueFiles?.map((downloadUrl: string, index: number) => (
          <SingleItemDownload key={index} setDownloadQueueFiles={setDownloadQueueFiles} downloadUrl={downloadUrl} />
        ))}
      </div>
    </div>
  );
};

const SingleItemDownload = ({ setDownloadQueueFiles, downloadUrl }: SingleItemDownloadProps) => {
  const isDownloadingStartRef = useRef(true);

  const [progressInfo, setProgressInfo] = useState<any>({
    fileName: downloadUrl.split('/').pop(),
    progress: 0,
    isCompleted: false,
    total: 0,
    loaded: 0,
  });

  const CancelToken: any = axios.CancelToken;
  const cancelSource: any = useRef<any>(null);

  useEffect(() => {
    if (!!isDownloadingStartRef?.current) {
      const startDownload = async () => {
        cancelSource.current = CancelToken.source();

        await axios
          .get(downloadUrl, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent: any) => {
              const { loaded, total } = progressEvent;
              const progress = Math.floor((loaded * 100) / total);
              setProgressInfo((info: any) => ({ ...info, progress, loaded, total }));
            },
            cancelToken: cancelSource.current.token,
          })
          .then(function (response) {
            const url = window.URL.createObjectURL(
              new Blob([response.data], {
                type: response.headers['content-type'],
              })
            );

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', progressInfo?.fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setProgressInfo((info: any) => ({ ...info, isCompleted: true }));
            toast.success(`${progressInfo?.fileName} successfully downloaded.`);
          })
          .catch((err: any) => {
            setProgressInfo((info: any) => ({ ...info, isCanceled: true }));
            toast.error(err.message);
          })
          .finally(() => {
            setDownloadQueueFiles((prevFiles: string[]) => prevFiles?.filter((url) => url !== downloadUrl));
          });
      };

      startDownload();
    }

    return () => {
      isDownloadingStartRef.current = false;
    };
  }, []);

  const onDownloadCancel = () => {
    cancelSource.current.cancel(`${progressInfo?.fileName} downloading cancelled.`);
  };

  return (
    <div className="flex justify-between items-center space-x-2">
      <span>
        <Icon name="photo" className="w-6 h-6 text-white" />
      </span>
      <span>
        {!progressInfo?.isCompleted && progressInfo?.loaded <= 0 ? (
          <span>{progressInfo?.fileName} waiting for download.</span>
        ) : (
          <span className="flex space-x-1 justify-start items-center">
            {progressInfo?.fileName} - (
            <span>
              <span className="text-red-600">{bytesToMB(progressInfo.loaded)}</span> of {bytesToMB(progressInfo.total)}
              MB)
            </span>
            {!progressInfo?.isCompleted && progressInfo?.progress < 100 && (
              <button onClick={onDownloadCancel}>
                <Icon name="close" className="w-4 h-4 rounded-full border border-red-600 text-red-600" />
              </button>
            )}
          </span>
        )}
      </span>
    </div>
  );
};

export default memo(FileDownloaderProgressBar);
