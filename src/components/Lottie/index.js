import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const Lottie = ({ path, loop = true, ...props }) => {
  const ref = useRef(null);
  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: ref.current,
      renderer: 'canvas',
      loop,
      autoplay: true,
      path: window.PUBLIC_URL + path
    });

    return () => {
      animation.destroy();
    };
  }, [path]);
  return <div {...props} ref={ref} />;
};

export default Lottie;
