import { useState, useEffect } from 'react';

export function useModal() {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState<'entering' | 'visible' | 'leaving'>(
    'entering'
  );

  const openModal = (cover: string) => {
    setModalImage(cover);
    setShowModal(true);
    setModalAnimation('entering');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      setModalAnimation('visible');
    }, 10);
  };

  const closeModal = () => {
    setModalAnimation('leaving');
    document.body.style.overflow = 'unset';

    setTimeout(() => {
      setShowModal(false);
      setModalImage(null);
      setModalAnimation('entering');
    }, 300);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  return { modalImage, showModal, modalAnimation, openModal, closeModal };
}
