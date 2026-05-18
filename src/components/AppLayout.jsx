import { useLocation } from 'react-router-dom';
import AudioPlayer from './AudioPlayer';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isBookPage = location.pathname.startsWith('/book/');

  return (
    <>
      {children}
      {!isBookPage && <AudioPlayer />}
    </>
  );
};

export default AppLayout;
