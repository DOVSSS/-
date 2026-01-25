import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import styles from './ImageSlider.module.css';

function ImageSlider({ images, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={styles.slider}>
        <div className={styles.imageContainer}>
          <div className={styles.placeholder}>
            Нет изображения
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.slider}>
      <div className={styles.imageContainer}>
        <LazyLoadImage
          src={images[currentIndex]}
          alt={`${productName} - изображение ${currentIndex + 1}`}
          effect="blur"
          className={styles.image}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Предыдущее изображение"
            >
              <FaChevronLeft />
            </button>
            
            <button
              onClick={goToNext}
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="Следующее изображение"
            >
              <FaChevronRight />
            </button>
            
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${styles.thumbnail} ${
                index === currentIndex ? styles.active : ''
              }`}
              aria-label={`Перейти к изображению ${index + 1}`}
            >
              <LazyLoadImage
                src={image}
                alt={`Миниатюра ${index + 1}`}
                effect="blur"
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageSlider;